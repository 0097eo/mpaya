from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, MeView, TechnicianDetailView, TechnicianListCreateView

urlpatterns = [
    path('login/',             LoginView.as_view(),              name='login'),
    path('refresh/',     TokenRefreshView.as_view(),       name='token_refresh'),
    path('logout/',            LogoutView.as_view(),             name='logout'),
    path('me/',                MeView.as_view(),                 name='me'),
    path('technicians/',       TechnicianListCreateView.as_view(), name='technician-list-create'),
    path('technicians/<uuid:pk>/', TechnicianDetailView.as_view(),   name='technician-detail'),
]
