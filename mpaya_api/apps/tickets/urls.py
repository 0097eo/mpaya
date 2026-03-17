from django.urls import path
from .views import (
    TicketListCreateView,
    TicketDetailView,
    TicketStatusUpdateView,
    TicketResolveView,
    TechnicianListView,
    TicketAssignView,
)

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<uuid:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('<uuid:pk>/status/', TicketStatusUpdateView.as_view(), name='ticket-status'),
    path('<uuid:pk>/resolve/', TicketResolveView.as_view(), name='ticket-resolve'),
    path('<uuid:pk>/assign/',       TicketAssignView.as_view()),
    path('technicians/', TechnicianListView.as_view(), name='technician-list'),
]
