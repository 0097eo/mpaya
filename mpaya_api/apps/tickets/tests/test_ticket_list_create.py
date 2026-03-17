from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.tickets.models import Ticket

User = get_user_model()


def auth(user):
    return f'Bearer {RefreshToken.for_user(user).access_token}'


def make_admin(**kwargs):
    return User.objects.create_user(role=User.ADMIN, **kwargs)


def make_technician(**kwargs):
    return User.objects.create_user(role=User.TECHNICIAN, **kwargs)


class TicketListCreateViewTests(APITestCase):
    def setUp(self):
        self.url = '/api/v1/tickets/'
        self.admin = make_admin(username='admin', password='pass12345')
        self.tech1 = make_technician(username='tech1', password='pass12345')
        self.tech2 = make_technician(username='tech2', password='pass12345')

        self.ticket1 = Ticket.objects.create(
            title='Meter fault',
            description='Meter not reading',
            meter_serial_number='MSN001',
            assigned_to=self.tech1,
            created_by=self.admin,
            assigned_at=timezone.now()
        )
        self.ticket2 = Ticket.objects.create(
            title='Power cut',
            description='No power',
            meter_serial_number='MSN002',
            assigned_to=self.tech2,
            created_by=self.admin,
            assigned_at=timezone.now()
        )

    # --- Technician GET ---

    def test_technician_sees_only_own_tickets(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Meter fault')  # use title instead

    def test_technician_does_not_see_other_technician_tickets(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.get(self.url)
        data = response.data.get('results', response.data)
        titles = [t['title'] for t in data]
        self.assertNotIn('Power cut', titles)  # tech2's ticket title

    def test_technician_cannot_see_meter_serial_on_active_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.get(self.url)
        data = response.data.get('results', response.data)
        self.assertNotIn('meter_serial_number', data[0])

    def test_admin_always_sees_meter_serial(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url)
        data = response.data.get('results', response.data)
        self.assertIn('meter_serial_number', data[0])

    # --- Admin GET ---

    def test_admin_sees_all_tickets(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 2)

    def test_admin_filter_by_status(self):
        self.ticket1.status = Ticket.IN_PROGRESS
        self.ticket1.save()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url, {'status': 'in_progress'})
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['status'], 'in_progress')

    def test_admin_filter_by_technician_username(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url, {'technician': 'tech1'})
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['assigned_to']['username'], 'tech1')

    def test_admin_filter_by_date(self):
        from django.utils.timezone import now
        today = now().date().isoformat()
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url, {'date': today})
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 2)

    def test_invalid_date_filter_returns_empty(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.get(self.url, {'date': 'not-a-date'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 2)  # bad date ignored, returns all

    # --- POST ---

    def test_admin_can_create_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.post(self.url, {
            'title': 'New fault',
            'description': 'Something broken',
            'meter_serial_number': 'MSN999',
            'assigned_to': str(self.tech1.id),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Ticket.objects.filter(meter_serial_number='MSN999').exists())

    def test_ticket_created_by_is_set_to_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        self.client.post(self.url, {
            'title': 'New fault',
            'description': 'Something broken',
            'meter_serial_number': 'MSN999',
            'assigned_to': str(self.tech1.id),
        })
        ticket = Ticket.objects.get(meter_serial_number='MSN999')
        self.assertEqual(ticket.created_by, self.admin)

    def test_cannot_assign_ticket_to_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.admin))
        response = self.client.post(self.url, {
            'title': 'Bad assignment',
            'description': 'Assigning to admin',
            'meter_serial_number': 'MSN888',
            'assigned_to': str(self.admin.id),
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_technician_cannot_create_ticket(self):
        self.client.credentials(HTTP_AUTHORIZATION=auth(self.tech1))
        response = self.client.post(self.url, {
            'title': 'Sneaky ticket',
            'description': 'Tech trying to create',
            'meter_serial_number': 'MSN777',
            'assigned_to': str(self.tech1.id),
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)