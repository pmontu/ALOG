from django.shortcuts import render
from django.http import HttpResponse

from django.template import RequestContext, loader

from activity.models import Activity

from activity.models import Datehour
from datetime import date, timedelta

def index(request):
	activity = "Hello"

	context = {'activity': activity}
	return render(request, 'activity/index.html', context)
