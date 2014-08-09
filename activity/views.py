from django.shortcuts import render
from django.http import HttpResponse

from django.template import RequestContext, loader

from activity.models import Activity

from activity.models import Datehour
from datetime import date, timedelta

from django.core import serializers

import json

def viewgrid(request, year, month, day, day_numbers):

	day_numbers=int(day_numbers)
	date_start = date(int(year),int(month),int(day))


	#return HttpResponse(days_in_page)

	activities = []
	activity = None
	
	i=0
	while i<day_numbers:

		d = date_start + timedelta(days=i)
		i+=1
			
		for h in range(1,25):

			#
			# query. datehour & activity
			# packaging. blanks & sleep
			#
			
			datehours = Datehour.objects.filter(date=d,hour=h)
			if len(datehours)==1:
				datehour = datehours[0]
				activitys = Activity.objects.filter(datehour=datehour)
				if len(activitys)>0:

					activity = activitys[0]

				else:
					dh = Datehour(date=d,hour=h)

					activity = Activity(datehour=dh, activity = Activity.SLEEP, details="")
			else:
				dh = Datehour(date=d,hour=h)
				activity = Activity(datehour=dh,activity=Activity.BLANK,details="")
			
			activities.append(activity)


	#data = serializers.serialize("json", activities)
	
	#
	# json conversion 
	#

	data = []
	for a in activities:
		data.append({
			'id':a.id,
			'date':str(a.datehour.date),
			'hour':a.datehour.hour,
			'activity':a.get_activity_display(),
			'details':a.details,
			})
	
	data_json = json.dumps(data)

	return HttpResponse(data_json, mimetype='application/json')


