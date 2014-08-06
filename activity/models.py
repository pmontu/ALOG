from django.db import models

class Datehour(models.Model):
	date = models.DateField()
	hour = models.IntegerField()
	def __unicode__(self):
		return u"%s %s" % (self.date, self.hour)
	class Meta:
		unique_together = ('date', 'hour',)
		ordering = ('date','hour',)

class Activity(models.Model):
	FOOD = 'FD'
	WORK = 'WK'
	WORKOUT = 'WO'
	LEISURE = 'LE'
	SOCIAL = 'SO'
	TRAVEL = 'TR'
	DOCTOR = 'DC'
	SLEEP = 'SL'
	ACTIVITY_CHOICES = (
		(FOOD, 'Food'),
		(WORK, 'Work'),
		(WORKOUT, 'Workout'),
		(LEISURE, 'Leisure'),
		(SOCIAL,'Social'),
		(DOCTOR,'Doctor'),
		(TRAVEL,'Travel'),
		(SLEEP,'Sleep'),
		)
	activity = models.CharField(max_length=2,
	choices=ACTIVITY_CHOICES,
	default=LEISURE)
	datehour = models.ForeignKey(Datehour)
	details = models.CharField(max_length=200,blank=True)
	def __unicode__(self):
		for act in self.ACTIVITY_CHOICES:
			if act[0]==self.activity:
				return act[1]
