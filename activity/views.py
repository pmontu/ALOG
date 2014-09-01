from django.http import HttpResponse, QueryDict

from activity.models import Activity
from activity.models import Datehour
from django.db.models import Max, Min

from django.db.models import Max, Min

from datetime import date, timedelta
from time import strptime
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
			'code':a.activity,
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

def add(request):

	try:
		j = json.loads(request.body)
	except ValueError:
		raise ValueError("Invalid Json string in request body")


	if "date" in j:
		x = j["date"]
		try:
			s = strptime(x,"%Y-%m-%d")
			#	DATE
			dt = date(year=s.tm_year,month=s.tm_mon,day=s.tm_mday)
		except ValueError:
			raise ValueError("Invalid date format")
	else:
		raise KeyError("Missing 'date'")
			

	if "hour" in j:
		x = j["hour"]
		try:
			hr = int(x)
		except Exception:
			raise ValueError("Invalid hour format")
		if not hr >= 1 or not hr <=24:
			raise ValueError("Invalid hour value (1-24)")
	else:
		raise KeyError("Missing 'hour'")

	#	ACTIVITIES
	activities = []
	if "activities" in j:
		a = j["activities"]
		if hasattr(a,"__iter__"):
			for item in a:
				for choice in Activity.ACTIVITY_CHOICES:
					if choice[0] == item:
						activities.append(item)
						break
			if len(activities)==0:
				raise ValueError("No valid activity codes found in 'activities'")
		else:
			raise StopIteration("Invalid list of activities")
	else:
		raise KeyError("Missing 'activities'")


	if Datehour.objects.filter(date=dt,hour=hr).count()<>0:
		raise Exception("Date hour entry already present")

	rowsAffected = 0
	d = Datehour(date=dt,hour=hr)
	d.save()
	rowsAffected += 1
	for act in activities:
		a = Activity(activity=act,datehour=d)
		a.save()
		rowsAffected += 1

	return HttpResponse(json.dumps({"rowsaffected":rowsAffected}),"application/json")