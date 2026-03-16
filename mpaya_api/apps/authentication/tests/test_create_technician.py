from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


def auth_header(user):
    refresh = RefreshToken.for_user(user)
    return f'Bearer {refresh.access_token}'


class TechnicianListCreateViewTests(APITestCase):
    def setUp(self):
        self.url = '/api/v1/auth/technicians/'

        self.admin = User.objects.create_user(
            username='admin',
            email='admin@mpaya.com',
            password='adminpass123',
            role=User.ADMIN,
        )
        self.technician = User.objects.create_user(
            username='tech1',
            email='tech1@mpaya.com',
            password='techpass123',
            role=User.TECHNICIAN,
        )
        self.client.credentials(HTTP_AUTHORIZATION=auth_header(self.admin))

    # --- LIST ---

    def test_admin_can_list_technicians(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle both paginated and non-paginated responses
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['username'], 'tech1')

    def test_list_only_returns_technicians(self):
        response = self.client.get(self.url)
        data = response.data.get('results', response.data)
        roles = [u['role'] for u in data]
        self.assertTrue(all(r == User.TECHNICIAN for r in roles))

    def test_non_admin_cannot_list_technicians(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth_header(self.technician))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_technicians(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- CREATE ---

    def test_admin_can_create_technician(self):
        response = self.client.post(self.url, {
            'username': 'newtech',
            'email': 'newtech@mpaya.com',
            'password': 'newpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newtech', role=User.TECHNICIAN).exists())

    def test_created_technician_has_correct_role(self):
        self.client.post(self.url, {
            'username': 'newtech',
            'email': 'newtech@mpaya.com',
            'password': 'newpass123',
        })
        user = User.objects.get(username='newtech')
        self.assertEqual(user.role, User.TECHNICIAN)

    def test_duplicate_username_returns_400(self):
        response = self.client.post(self.url, {
            'username': 'tech1',  # already exists
            'email': 'other@mpaya.com',
            'password': 'newpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_returns_400(self):
        response = self.client.post(self.url, {
            'username': 'uniquetech',
            'email': 'tech1@mpaya.com',  # already exists
            'password': 'newpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_password_returns_400(self):
        response = self.client.post(self.url, {
            'username': 'newtech',
            'email': 'newtech@mpaya.com',
            'password': 'short',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_username_returns_400(self):
        response = self.client.post(self.url, {
            'email': 'newtech@mpaya.com',
            'password': 'newpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_admin_cannot_create_technician(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth_header(self.technician))
        response = self.client.post(self.url, {
            'username': 'newtech',
            'email': 'newtech@mpaya.com',
            'password': 'newpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TechnicianDetailViewTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@mpaya.com',
            password='adminpass123',
            role=User.ADMIN,
        )
        self.technician = User.objects.create_user(
            username='tech1',
            email='tech1@mpaya.com',
            password='techpass123',
            role=User.TECHNICIAN,
        )
        self.url = f'/api/v1/auth/technicians/{self.technician.id}/'
        self.client.credentials(HTTP_AUTHORIZATION=auth_header(self.admin))

    def test_admin_can_retrieve_technician(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'tech1')

    def test_admin_can_delete_technician(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='tech1').exists())

    def test_non_admin_cannot_delete_technician(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth_header(self.technician))
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_nonexistent_technician_returns_404(self):
        response = self.client.get('/api/v1/auth/technicians/00000000-0000-0000-0000-000000000000/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)