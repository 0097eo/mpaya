from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from apps.authentication.permissions import IsAdmin, IsTechnician
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


def make_request(user):
    factory = RequestFactory()
    request = factory.get('/')
    request.user = user
    return request


class IsAdminPermissionTests(TestCase):
    def test_admin_user_is_permitted(self):
        user = User.objects.create_user(
            username='admin', password='pass12345', role=User.ADMIN
        )
        self.assertTrue(IsAdmin().has_permission(make_request(user), None))

    def test_technician_is_denied(self):
        user = User.objects.create_user(
            username='tech', password='pass12345', role=User.TECHNICIAN
        )
        self.assertFalse(IsAdmin().has_permission(make_request(user), None))

    def test_unauthenticated_user_is_denied(self):
        self.assertFalse(IsAdmin().has_permission(make_request(AnonymousUser()), None))


class IsTechnicianPermissionTests(TestCase):
    def test_technician_is_permitted(self):
        user = User.objects.create_user(
            username='tech', password='pass12345', role=User.TECHNICIAN
        )
        self.assertTrue(IsTechnician().has_permission(make_request(user), None))

    def test_admin_is_denied(self):
        user = User.objects.create_user(
            username='admin', password='pass12345', role=User.ADMIN
        )
        self.assertFalse(IsTechnician().has_permission(make_request(user), None))

    def test_unauthenticated_user_is_denied(self):
        self.assertFalse(IsTechnician().has_permission(make_request(AnonymousUser()), None))