"""
HAD BETTER URL Configuration
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('apps.users.urls.auth_urls')),
    path('api/v1/users/', include('apps.users.urls.user_urls')),
    path('api/v1/places/', include('apps.places.urls')),
    path('api/v1/saved-places/', include('apps.places.urls_saved')),
    path('api/v1/itineraries/', include('apps.itineraries.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),

    # API 문서
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
