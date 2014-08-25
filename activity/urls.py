from django.conf.urls import patterns, url

from activity import views

urlpatterns = patterns(
	'',
    url(r'^activities/(\d{4})/(\d{1,2})/(\d{1,2})/(\d+)/rows\.json$',
    	views.getActivities
	),
	url(r'^activities/daterange\.json$',
		views.getDateRange
	),
	url(r'^add/$',views.add),
)