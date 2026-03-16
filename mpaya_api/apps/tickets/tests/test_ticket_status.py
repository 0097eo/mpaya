from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.tickets.models import Ticket

User = get_user_model()


def auth(user):
    return f'Bearer {RefreshToken.for_user(user).access_token}'


class TicketStatusUpdateViewTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='pass12345', role=User.ADMIN)
        self.tech1 = User.objects.create_user(username='tech1', password='pass12345', role=User.TECHNICIAN)
        self.tech2 = User.objects.create_user(username='tech2', password='pass12345', role=User.TECHNICIAN)

        self.ticket = Ticket.objects.create(
            title='Meter fault',
            description='Meter not reading',
            meter_serial_number='MSN001',
            assigned_to=self.tech1,
            created_by=self.admin,
        )
        self.url = f'/api/v1/tickets/{self.ticket.id}/status/'

    def test_assigned_technician_can_mark_in_progress(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.patch(self.url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.IN_PROGRESS)

    def test_already_in_progress_returns_400(self):
        self.ticket.status = Ticket.IN_PROGRESS
        self.ticket.save()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.patch(self.url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resolved_ticket_cannot_be_updated(self):
        self.ticket.status = Ticket.RESOLVED
        self.ticket.save()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.patch(self.url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unassigned_technician_is_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech2))
        response = self.client.patch(self.url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_use_this_endpoint(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.patch(self.url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_value_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.patch(self.url, {'status': 'resolved'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nonexistent_ticket_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.patch(
            '/api/v1/tickets/00000000-0000-0000-0000-000000000000/status/',
            {'status': 'in_progress'}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)