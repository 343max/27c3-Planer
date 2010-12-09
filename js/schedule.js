
function Schedule(schedule) {
	this.schedule = schedule;

	this.timeToFloat = function(timeString) {
		return parseInt(timeString.substr(0, 2), 10)  + parseInt(timeString.substr(3, 2), 10) / 60;
	}

	this.floatanize = function() {
		var o = this;
		var s = this.schedule;

		s.conference.day_change_float = this.timeToFloat(s.conference.day_change);
		s.conference.timeslot_duration_float = this.timeToFloat(s.conference.timeslot_duration);

		s.day.byDate = function(dateString) {
			var day = null;

			$.each(this, function() {
				if(this['@attributes'].date == dateString) day = this;
			});

			return day;
		};

		$.each(s.day, function() {
			var timeStart = 10000;
			var timeEnd = -10000;

			this.room.byName = function(roomName) {
				var room = null;

				$.each(this, function() {
					if(this['@attributes'].name == roomName) room = this;
				});

				return room;
			};

			$.each(this.room, function() {
				this.event.byTimeSlot = function(startTime, endTime) {
					var events = [];

					$.each(this, function() {
						var withinSlot = false;

						if((this.start_float >= startTime) && (this.start_float <= endTime)) withinSlot = true;
						if((this.end_float >= startTime) && (this.end_float <= endTime)) withinSlot = true;
						if((this.start_float <= startTime) && (this.end_float >= endTime)) withinSlot = true;

						if(withinSlot) events.push(this);
					});

					return events;
				}

				$.each(this.event, function() {
					this.duration_float = o.timeToFloat(this.duration);
					this.start_float = o.timeToFloat(this.start);
					this.end_float = this.duration_float + this.start_float;

					var cTime = this.start_float;
					if(cTime <= s.conference.day_change_float) cTime += 24;

					if(cTime < timeStart) timeStart = cTime;
					if(cTime + this.duration_float > timeEnd) timeEnd = cTime + this.duration_float;
				});
			});

			this.timeStart = timeStart;
			this.timeEnd = timeEnd;
		})
	}

	this.floatanize();

	this.getEventsFor = function(dayNum, roomNum, hourStart, hourEnd) {
		var o = this;
		var events = [];

		$.each(this.schedule.day[dayNum].room[roomNum].event, function() {
			
		});
	}
}
