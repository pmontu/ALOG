from django.shortcuts import render
from django.http import HttpResponse

from django.template import RequestContext, loader

from activity.models import Activity

from activity.models import Datehour
from datetime import date, timedelta

from django.core import serializers

import json

def viewgrid(request, year, month, day, day_numbers):

	year = int(year)
	month = int(month)
	day = int(day)
	day_numbers=int(day_numbers)

	date_start = date(year,month,day)
	date_end = date_start + timedelta(days=day_numbers-1)


	#
	# query raw join 
	#

	activities = []
	activities = Activity.objects.raw('''
		select A.id
		from activity_activity as A, activity_datehour as D 
		where 
			D.id = A.datehour_id and 
			D.date between '%s' and '%s'
		''' % (str(date_start), str(date_end)) )
	
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


