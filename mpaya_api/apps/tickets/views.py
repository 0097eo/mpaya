from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.dateparse import parse_date
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from apps.authentication.permissions import IsAdmin, IsTechnician
from apps.authentication.serializers import UserSerializer
from .models import Ticket
from .serializers import (
    TicketListSerializer,
    TicketDetailSerializer,
    TicketCreateSerializer,
    TicketStatusSerializer,
    TicketResolveSerializer,
)

User = get_user_model()


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(name='status', description='Filter by status: pending, in_progress, resolved', required=False, type=str),
            OpenApiParameter(name='date', description='Filter by date (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='technician', description='Filter by technician username (partial match)', required=False, type=str),
        ]
    ),
    post=extend_schema(parameters=[])
)
class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  — Technician sees today's assigned tickets.
           Admin sees all tickets, filterable by date/status/technician.
    POST — Admin creates a ticket.
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketListSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Ticket.objects.none()

        user = self.request.user
        qs = Ticket.objects.select_related('assigned_to', 'created_by')

        if user.role == User.TECHNICIAN:
            start_of_today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            return qs.filter(assigned_to=user, created_at__gte=start_of_today)

        # Admin — full visibility with optional filters
        status_filter     = self.request.query_params.get('status')
        date_filter       = self.request.query_params.get('date')
        technician_filter = self.request.query_params.get('technician')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if date_filter:
            parsed = parse_date(date_filter)
            if parsed:
                qs = qs.filter(created_at__date=parsed)
        if technician_filter:
            qs = qs.filter(assigned_to__username__icontains=technician_filter)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TicketDetailView(generics.RetrieveAPIView):
    """
    GET — Full ticket detail.
          Technicians can only view their own assigned tickets.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TicketDetailSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Ticket.objects.none()

        user = self.request.user
        qs = Ticket.objects.select_related('assigned_to', 'created_by')

        if user.role == User.TECHNICIAN:
            return qs.filter(assigned_to=user)

        return qs


class TicketStatusUpdateView(APIView):
    """
    PATCH /tickets/{id}/status/
    Technician only — moves ticket from pending to in_progress.
    """
    permission_classes = [IsAuthenticated, IsTechnician]
    serializer_class = TicketStatusSerializer

    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Ticket not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if ticket.assigned_to != request.user:
            return Response(
                {'error': True, 'message': 'You are not assigned to this ticket.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status == Ticket.RESOLVED:
            return Response(
                {'error': True, 'message': 'Resolved tickets cannot be updated.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if ticket.status == Ticket.IN_PROGRESS:
            return Response(
                {'error': True, 'message': 'Ticket is already in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TicketStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket.status = Ticket.IN_PROGRESS
        ticket.save()

        return Response({
            'id': str(ticket.id),
            'status': ticket.status,
            'message': 'Ticket marked as in progress.',
        })


class TicketResolveView(APIView):
    """
    POST /tickets/{id}/resolve/
    Technician only — core close-loop endpoint.
    Enforces pending → in_progress → resolved flow.
    """
    permission_classes = [IsAuthenticated, IsTechnician]
    serializer_class = TicketResolveSerializer

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Ticket not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if ticket.assigned_to != request.user:
            return Response(
                {'error': True, 'message': 'You are not assigned to this ticket.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status == Ticket.RESOLVED:
            return Response(
                {'error': True, 'message': 'Ticket is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if ticket.status == Ticket.PENDING:
            return Response(
                {'error': True, 'message': 'Ticket must be in progress before it can be resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TicketResolveSerializer(
            data=request.data,
            context={'ticket': ticket}
        )
        serializer.is_valid(raise_exception=True)

        ticket.status = Ticket.RESOLVED
        ticket.resolution_summary = serializer.validated_data['resolution_summary']
        ticket.resolved_meter_serial = serializer.validated_data['resolved_meter_serial']
        ticket.resolved_at = timezone.now()
        ticket.save()

        return Response({
            'id': str(ticket.id),
            'status': ticket.status,
            'resolved_at': ticket.resolved_at,
            'message': 'Ticket resolved successfully.',
        })


class TechnicianListView(generics.ListAPIView):
    """
    GET /tickets/technicians/
    Admin only — list technicians for ticket assignment dropdown.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.filter(role=User.TECHNICIAN)

    def get(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)