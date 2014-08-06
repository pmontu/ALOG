from activity.models import Activity
from activity.models import Datehour
HOUR=range(13,22)
DATE="2014-07-31"
ACTIVITY=[
	[Activity.FOOD],
	[Activity.SLEEP],
	[Activity.SLEEP],
	[Activity.FOOD],
	[Activity.SOCIAL],
	[Activity.SOCIAL],
	[Activity.SOCIAL],
	[Activity.FOOD],
	[Activity.LEISURE],
	[Activity.LEISURE]
	]
i=0
while i<len(HOUR):
	d = Datehour.objects.filter(date=DATE,hour=HOUR[i])[0]
	for a in ACTIVITY[i]:
		a = Activity(activity=a,datehour=d)
		a.save()
	i+=1