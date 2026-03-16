from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginViewTests(APITestCase):
    def setUp(self):
        self.url = '/api/v1/auth/login/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@mpaya.com',
            password='securepass123',
            role=User.TECHNICIAN,
        )

    def test_valid_credentials_returns_tokens_and_user(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'securepass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_user_payload_fields(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'securepass123',
        })
        user = response.data['user']
        self.assertEqual(user['email'], self.user.email)
        self.assertEqual(user['username'], self.user.username)
        self.assertEqual(user['role'], User.TECHNICIAN)
        self.assertIn('id', user)

    def test_wrong_password_returns_401(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_user_returns_401(self):
        response = self.client.post(self.url, {
            'username': 'ghost',
            'password': 'securepass123',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_fields_returns_400(self):
        response = self.client.post(self.url, {'username': 'testuser'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access_allowed(self):
        # LoginView has AllowAny — no credentials needed
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'securepass123',
        })
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)