from django.shortcuts import render
from django.http import HttpResponse

from activity.models import Activity
from activity.models import Datehour
from django.db.models import Max, Min

from django.db.models import Max, Min

from datetime import date, timedelta
import json

def getActivities(request, year, month, day, day_numbers):



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

def getDateRange(request):

	#	QUERY
	datemin = (Datehour.objects.all().aggregate(Min('date')))['date__min']
	datemax = (Datehour.objects.all().aggregate(Max('date')))['date__max']

	#	VALIDATION
	#	BOTH WILL BE NONE OR HAVE VALUE
	#	TODAY WILL BE DEFAULT IN THIS CASE
	if(datemin == None and datemax == None):
		datemin = datemax = date.today()

	#	CONVERTING TO JSON AND SENDING RESPONSE
	data_json=json.dumps({"min":str(datemin),"max":str(datemax)})
	return HttpResponse(data_json,mimetype="application/json")