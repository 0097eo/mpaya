from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings 
from django.conf.urls.static import static 
from django.views.generic import RedirectView 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/api/docs/', permanent=True)),

    # API docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # App routes
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/tickets/', include('apps.tickets.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
