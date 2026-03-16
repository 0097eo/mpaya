from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.tickets.models import Ticket

User = get_user_model()


def auth(user):
    return f'Bearer {RefreshToken.for_user(user).access_token}'


class TicketDetailViewTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='pass12345', role=User.ADMIN)
        self.tech1 = User.objects.create_user(username='tech1', password='pass12345', role=User.TECHNICIAN)
        self.tech2 = User.objects.create_user(username='tech2', password='pass12345', role=User.TECHNICIAN)

        self.ticket = Ticket.objects.create(
            title='Meter fault',
            description='Meter not reading correctly',
            meter_serial_number='MSN001',
            assigned_to=self.tech1,
            created_by=self.admin,
        )
        self.url = f'/api/v1/tickets/{self.ticket.id}/'

    def test_admin_can_retrieve_any_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['meter_serial_number'], 'MSN001')

    def test_assigned_technician_can_retrieve_own_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unassigned_technician_cannot_retrieve_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech2))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_ticket_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get('/api/v1/tickets/00000000-0000-0000-0000-000000000000/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)