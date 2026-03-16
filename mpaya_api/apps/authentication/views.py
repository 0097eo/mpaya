from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from apps.authentication.permissions import IsAdmin
from .serializers import MPayaTokenSerializer, UserSerializer, LogoutSerializer, CreateTechnicianSerializer

User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MPayaTokenSerializer


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


class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class TechnicianListCreateView(generics.ListCreateAPIView):
    """
    GET  — Admin lists all technicians
    POST — Admin creates a new technician account
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTechnicianSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.TECHNICIAN).order_by('-date_joined')

    def perform_create(self, serializer):
        serializer.save()


class TechnicianDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    — Get technician detail
    DELETE — Admin removes a technician
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.filter(role=User.TECHNICIAN)