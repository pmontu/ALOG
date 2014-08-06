from django.shortcuts import render
from django.http import HttpResponse

from django.template import RequestContext, loader

from activity.models import Activity

from activity.models import Datehour
from datetime import date, timedelta

def index(request):
	activities_last_5_days = []

	i=5
	while i>0:
		day = Datehour.objects.filter(date=date.today()-timedelta(days=i))
		Activities_day = Activity.objects.filter(datehour=day)
		activities_last_5_days.append(Activities_day)
		i-=1

	activities_last_5_days = zip(*activities_last_5_days)


	context = {'activities_last_5_days': activities_last_5_days}
	return render(request, 'activity/index.html', context)
