from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class MeViewTests(APITestCase):
    def setUp(self):
        self.url = '/api/v1/auth/me/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@mpaya.com',
            password='securepass123',
            role=User.TECHNICIAN,
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_me_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_me_returns_correct_fields(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['role'], User.TECHNICIAN)

    def test_get_me_unauthenticated_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_not_allowed(self):
        response = self.client.patch(self.url, {'username': 'newname'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_not_allowed(self):
        response = self.client.put(self.url, {'username': 'newname'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)