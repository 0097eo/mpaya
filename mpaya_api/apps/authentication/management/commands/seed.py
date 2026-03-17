from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.tickets.models import Ticket

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo users and tickets for the M-Paya presentation'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing tickets...')
        Ticket.objects.all().delete()

        admin    = self._create_user('admin',    'admin@mpaya.com',    User.ADMIN)
        tech1    = self._create_user('tech1',    'tech1@mpaya.com',    User.TECHNICIAN)
        tech2    = self._create_user('tech2',    'tech2@mpaya.com',    User.TECHNICIAN)
        support1 = self._create_user('support1', 'support1@mpaya.com', User.SUPPORT)
        support2 = self._create_user('support2', 'support2@mpaya.com', User.SUPPORT)

        now = timezone.now()

        tickets = [
            {
                'title': 'Meter not vending after M-Pesa payment',
                'description': (
                    'Tenant at Unit 4B paid KES 200 via M-Pesa on 17 Mar but meter did not '
                    'credit units. Payment confirmed on Safaricom end. Requires site visit '
                    'to inspect relay and vending module.'
                ),
                'meter_serial_number': 'MTR-2024-001',
                'assigned_to': tech1,
                'created_by': support1,
                'status': Ticket.PENDING,
            },
            {
                'title': 'Keypad unresponsive at Unit 9B',
                'description': (
                    'Tenant unable to enter token — keypad not registering any input. '
                    'Meter appears powered. Possible keypad module failure.'
                ),
                'meter_serial_number': 'MTR-2024-005',
                'assigned_to': tech1,
                'created_by': support1,
                'status': Ticket.PENDING,
            },
            {
                'title': 'Display showing error code E04',
                'description': (
                    'Three-phase meter at Block C showing persistent E04 fault code. '
                    'Tenant unable to use meter. Technician has attended site, '
                    'relay inspection in progress.'
                ),
                'meter_serial_number': 'MTR-2024-007',
                'assigned_to': tech1,
                'created_by': support2,
                'status': Ticket.IN_PROGRESS,
            },
            {
                'title': 'Water meter reading inconsistent',
                'description': (
                    'Meter at Unit 3A reporting fluctuating readings. Tenant disputes '
                    'billing — claims usage does not match charged units. Calibration '
                    'check initiated.'
                ),
                'meter_serial_number': 'WTR-2024-008',
                'assigned_to': tech2,
                'created_by': support2,
                'status': Ticket.IN_PROGRESS,
            },
            {
                'title': 'Unassigned — meter fault at Unit 12D',
                'description': (
                    'Tenant reports meter displaying dashes instead of balance. '
                    'Unable to vend tokens. Logged by support, pending technician assignment.'
                ),
                'meter_serial_number': 'MTR-2024-011',
                'assigned_to': None,
                'created_by': support1,
                'status': Ticket.PENDING,
            },
            {
                'title': 'Tamper alert triggered at Unit 2C',
                'description': (
                    'System logged a tamper alert at 02:14. Physical inspection required '
                    'to confirm whether tampering occurred and document findings.'
                ),
                'meter_serial_number': 'MTR-2024-003',
                'assigned_to': tech2,
                'created_by': support1,
                'status': Ticket.RESOLVED,
                'resolution_summary': (
                    'Inspected meter casing — seal was broken due to accidental impact, '
                    'no evidence of deliberate tampering. Replaced casing seal and reset '
                    'tamper flag. Meter functioning normally. Tenant informed.'
                ),
                'resolved_meter_serial': 'MTR-2024-003',
                'resolved_at': now,
            },
            {
                'title': 'Blank display at Unit 7A',
                'description': (
                    'Meter display completely blank. Tenant unable to check balance '
                    'or enter tokens. Suspected internal power board fault.'
                ),
                'meter_serial_number': 'MTR-2024-002',
                'assigned_to': tech1,
                'created_by': support2,
                'status': Ticket.RESOLVED,
                'resolution_summary': (
                    'Replaced internal power regulation board. Display restored and '
                    'functioning correctly. Tested token entry — accepted and credited '
                    'successfully. Tenant confirmed resolution.'
                ),
                'resolved_meter_serial': 'MTR-2024-002',
                'resolved_at': now,
            },
        ]

        for data in tickets:
            resolved_at      = data.pop('resolved_at', None)
            resolved_summary = data.pop('resolution_summary', '')
            resolved_serial  = data.pop('resolved_meter_serial', '')

            ticket = Ticket.objects.create(
                **data,
                assigned_at=now if data.get('assigned_to') else None,
                resolution_summary=resolved_summary,
                resolved_meter_serial=resolved_serial,
                resolved_at=resolved_at,
            )
            self.stdout.write(self.style.SUCCESS(f'  Created ticket: {ticket.title}'))

        self.stdout.write(self.style.SUCCESS('\nSeed complete. Credentials:'))
        self.stdout.write('  admin    / mpaya1234  (admin)')
        self.stdout.write('  tech1    / mpaya1234  (technician)')
        self.stdout.write('  tech2    / mpaya1234  (technician)')
        self.stdout.write('  support1 / mpaya1234  (support)')
        self.stdout.write('  support2 / mpaya1234  (support)')

    def _create_user(self, username, email, role):
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password='mpaya1234',
                role=role,
            )
            self.stdout.write(self.style.SUCCESS(f'  Created user: {username}'))
            return user
        self.stdout.write(f'  Already exists: {username}')
        return User.objects.get(username=username)