from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class LogoutViewTests(APITestCase):
    def setUp(self):
        self.url = '/api/v1/auth/logout/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@mpaya.com',
            password='securepass123',
            role=User.TECHNICIAN,
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')

    def test_valid_refresh_token_logs_out(self):
        response = self.client.post(self.url, {'refresh': str(self.refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Logged out successfully.')

    def test_blacklisted_token_cannot_be_reused(self):
        self.client.post(self.url, {'refresh': str(self.refresh)})
        # Second logout with the same token should fail
        response = self.client.post(self.url, {'refresh': str(self.refresh)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['error'])

    def test_invalid_token_returns_400(self):
        response = self.client.post(self.url, {'refresh': 'not.a.valid.token'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['error'])

    def test_missing_refresh_field_returns_400(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_request_returns_401(self):
        self.client.credentials()  # clear auth header
        response = self.client.post(self.url, {'refresh': str(self.refresh)})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)