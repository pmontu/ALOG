from django.conf.urls import patterns, url

from activity import views

urlpatterns = patterns('',
    url(r'^activities/(\d+)/(\d+)/rows.json$', views.viewgrid, name='viewgrid'),
)