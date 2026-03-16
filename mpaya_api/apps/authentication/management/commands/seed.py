from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.tickets.models import Ticket

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo users and tickets for the M-Paya presentation'

    def handle(self, *args, **kwargs):
        admin = self._create_user('admin', 'admin@mpaya.com', User.ADMIN)
        tech1 = self._create_user('tech1', 'tech1@mpaya.com', User.TECHNICIAN)
        tech2 = self._create_user('tech2', 'tech2@mpaya.com', User.TECHNICIAN)

        tickets = [
            {
                'title': 'Meter fault at Unit 4B',
                'description': 'Tenant reports meter not vending tokens after payment.',
                'meter_serial_number': 'MTR-2024-001',
                'assigned_to': tech1,
            },
            {
                'title': 'No power at Unit 7A',
                'description': 'Meter display is blank, suspected power failure.',
                'meter_serial_number': 'MTR-2024-002',
                'assigned_to': tech1,
            },
            {
                'title': 'Tampered meter at Unit 2C',
                'description': 'Meter casing appears broken, possible tampering.',
                'meter_serial_number': 'MTR-2024-003',
                'assigned_to': tech1,
            },
            {
                'title': 'Tampered meter at Unit 5C',
                'description': 'Meter casing appears broken, possible tampering.',
                'meter_serial_number': 'MTR-2023-003',
                'assigned_to': tech2,
            },
        ]

        for data in tickets:
            if not Ticket.objects.filter(meter_serial_number=data['meter_serial_number']).exists():
                Ticket.objects.create(**data, created_by=admin)
                self.stdout.write(self.style.SUCCESS(f"Created ticket: {data['title']}"))
            else:
                self.stdout.write(f"Already exists: {data['title']}")

    def _create_user(self, username, email, role):
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password='mpaya1234',
                role=role,
            )
            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
            return user
        self.stdout.write(f"Already exists: {username}")
        return User.objects.get(username=username)