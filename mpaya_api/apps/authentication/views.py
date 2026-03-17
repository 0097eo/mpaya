from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from apps.authentication.permissions import IsAdmin, IsAdminOrSupport
from .serializers import MPayaTokenSerializer, UserSerializer, LogoutSerializer, CreateTechnicianSerializer, CreateSupportSerializer
from drf_spectacular.utils import extend_schema

User = get_user_model()


@extend_schema(tags=['auth'])
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MPayaTokenSerializer


@extend_schema(tags=['auth'])
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            token.blacklist()
        except TokenError:
            return Response(
                {'error': True, 'message': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'message': 'Logged out successfully.'})

@extend_schema(tags=['users'])
class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

@extend_schema(tags=['users'])
class TechnicianListCreateView(generics.ListCreateAPIView):
    """
    GET  — Admin lists all technicians
    POST — Admin creates a new technician account
    """
    permission_classes = [IsAuthenticated, IsAdminOrSupport]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTechnicianSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.TECHNICIAN, is_active=True).order_by('-date_joined')

    def perform_create(self, serializer):
        serializer.save()


@extend_schema(tags=['users'])
class TechnicianDetailView(APIView):
    """
    GET    — Get technician detail
    DELETE — Admin removes a technician
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role=User.TECHNICIAN, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Technician not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role=User.TECHNICIAN)
        except User.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Technician not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        user.is_active = False
        user.save()
        return Response({'message': f'{user.username} has been deactivated.'})


@extend_schema(tags=['users'])
class SupportUserListCreateView(generics.ListCreateAPIView):
    """
    GET  — Admin lists support users
    POST — Admin creates a new support user account
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateSupportSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.SUPPORT, is_active=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
@extend_schema(tags=['users'])
class SupportUserDeactivateView(APIView):
    """DELETE /tickets/support-users/{id}/deactivate/
Admin only — deactivates a support user account (soft delete)"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role=User.SUPPORT)
        except User.DoesNotExist:
            return Response({'error': True, 'message': 'Support user not found.'}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = False
        user.save()
        return Response({'message': f'{user.username} has been deactivated.'})