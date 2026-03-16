from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket

User = get_user_model()


class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class TicketListSerializer(serializers.ModelSerializer):
    assigned_to = TechnicianSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'meter_serial_number',
            'status', 'assigned_to', 'created_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.role != request.user.ADMIN:
            data.pop('meter_serial_number', None)
        return data


class TicketDetailSerializer(serializers.ModelSerializer):
    assigned_to = TechnicianSerializer(read_only=True)
    created_by = TechnicianSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'meter_serial_number',
            'status', 'assigned_to', 'created_by',
            'resolution_summary', 'resolved_meter_serial',
            'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'resolution_summary',
            'resolved_meter_serial', 'resolved_at',
            'created_at', 'updated_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.role != request.user.ADMIN:
            # Only expose serial after resolution, and only the verified one
            if instance.status != instance.RESOLVED:
                data.pop('meter_serial_number', None)
            data.pop('resolved_meter_serial', None) if instance.status != instance.RESOLVED else None
        return data


class TicketCreateSerializer(serializers.ModelSerializer):
    """Admin creates a ticket."""
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'meter_serial_number', 'assigned_to']

    def validate_assigned_to(self, value):
        if value.role != User.TECHNICIAN:
            raise serializers.ValidationError(
                'Tickets can only be assigned to technicians.'
            )
        return value


class TicketStatusSerializer(serializers.Serializer):
    """Update ticket to in_progress only."""
    status = serializers.ChoiceField(choices=[('in_progress', 'In Progress')])


class TicketResolveSerializer(serializers.Serializer):
    """
    Core business logic serializer.
    Validates resolution_summary, resolved_meter_serial,
    and that the serial matches the ticket record.
    """
    resolution_summary = serializers.CharField(
        min_length=10,
        error_messages={
            'required': 'Resolution summary is required to close a ticket.',
            'blank': 'Resolution summary is required to close a ticket.',
            'min_length': 'Resolution summary must be at least 10 characters.',
        }
    )
    resolved_meter_serial = serializers.CharField(
        error_messages={
            'required': 'Meter serial number is required to close a ticket.',
            'blank': 'Meter serial number is required to close a ticket.',
        }
    )

    def validate(self, attrs):
        ticket = self.context.get('ticket')

        # Core close-loop check — serial must match ticket record
        submitted = attrs['resolved_meter_serial'].strip().upper()
        expected = ticket.meter_serial_number.strip().upper()

        if submitted != expected:
            raise serializers.ValidationError({
                'resolved_meter_serial': (
                    f'Meter serial number does not match ticket record. '
                   
                )
            })

        return attrs
