from django.conf.urls import patterns, url

from activity import views

urlpatterns = patterns('',
    url(r'^activities/(\d{4})/(\d{2})/(\d{2})/(\d+)/rows.json$', views.viewgrid, name='viewgrid'),
)