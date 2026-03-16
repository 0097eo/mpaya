from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.tickets.models import Ticket

User = get_user_model()


def auth(user):
    return f'Bearer {RefreshToken.for_user(user).access_token}'


VALID_PAYLOAD = {
    'resolution_summary': 'Replaced faulty meter unit.',
    'resolved_meter_serial': 'MSN001',
}


class TicketResolveViewTests(APITestCase):
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
            status=Ticket.IN_PROGRESS,  # must be in_progress to resolve
        )
        self.url = f'/api/v1/tickets/{self.ticket.id}/resolve/'

    def test_technician_can_resolve_in_progress_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.RESOLVED)
        self.assertIsNotNone(self.ticket.resolved_at)

    def test_resolution_fields_are_saved(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        self.client.post(self.url, VALID_PAYLOAD)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.resolution_summary, VALID_PAYLOAD['resolution_summary'])
        self.assertEqual(self.ticket.resolved_meter_serial, VALID_PAYLOAD['resolved_meter_serial'])

    def test_pending_ticket_cannot_be_resolved(self):
        self.ticket.status = Ticket.PENDING
        self.ticket.save()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_already_resolved_ticket_returns_400(self):
        self.ticket.status = Ticket.RESOLVED
        self.ticket.save()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wrong_meter_serial_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {
            'resolution_summary': 'Replaced faulty meter unit.',
            'resolved_meter_serial': 'WRONG999',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['error'])
        self.assertIn('resolved_meter_serial', response.data)

    def test_meter_serial_match_is_case_insensitive(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {
            'resolution_summary': 'Replaced faulty meter unit.',
            'resolved_meter_serial': 'msn001',  # lowercase
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_short_resolution_summary_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {
            'resolution_summary': 'Too short',  # under 10 chars... wait, it's 9
            'resolved_meter_serial': 'MSN001',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_resolution_summary_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {'resolved_meter_serial': 'MSN001'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_meter_serial_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {'resolution_summary': 'Replaced faulty meter unit.'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unassigned_technician_is_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech2))
        response = self.client.post(self.url, VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_resolve_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.post(self.url, VALID_PAYLOAD)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_nonexistent_ticket_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(
            '/api/v1/tickets/00000000-0000-0000-0000-000000000000/resolve/',
            VALID_PAYLOAD
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)