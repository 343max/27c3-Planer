$().ready(function() {
	var hourWidth = 180;
	var position = 0;
	var currentTime = 0;
	var currentyear = new Date().getFullYear();
	if(window.innerWidth <= 320) {
		hourWidth = (window.innerWidth) / 2 - 40;
	}

	var favedEvents = JSON.parse(localStorage.getItem('favedEvents'));
	if(!favedEvents) favedEvents = {};

	var drawSchedule = function(data) {
		var schedule = new Schedule(data.schedule);

		var days = [];

		var drawDayEvents = function(date, dayId) {
			var times = [];
			var day = schedule.schedule.day.byDate(date);

			var timeToRelativeTime = function(time) {
				if(time < schedule.schedule.conference.day_change_float) time += 24;
				return time - day.timeStart;
			}
			
			var timeToLeftPosition = function(time) {
				return timeToRelativeTime(time) * hourWidth + 20;
			};

			var drawRoomEvents = function(roomName, div) {
				div = $(div);

				var events = day.room.byName(roomName).event;

				$.each(events, function() {
					var slug = this.slug;

					var eventDiv = $('<div>').addClass('event');
					if(favedEvents[slug]) eventDiv.addClass('faved');
					
					var left = timeToLeftPosition(this.start_float);

					times.push({
						left: left,
						label: this.start,
						start: timeToRelativeTime(this.start_float)
					});

					eventDiv.css('left', left + 'px').css('width', (hourWidth * this.duration_float) + 'px');

					eventDiv.append(
						$('<a>').addClass('fav').html('&#9733;').click(function(event) {
							var parent = $(this).parent();
							parent.toggleClass('faved');
							favedEvents[slug] = parent.hasClass('faved');
							localStorage.setItem('favedEvents', JSON.stringify(favedEvents));

							event.preventDefault();
						})
					);

					eventDiv.append($('<h3>').text(this.title));
					eventDiv.append($('<h4>').text(this.subtitle));

					if(this.persons.person) {

						var personString = '';

						if(this.persons.person.join) {
							personString = this.persons.person.join(', ');
						} else {
							personString = this.persons.person;
						}

						eventDiv.append($('<p>').addClass('persons').text(personString));
					}

					div.append(eventDiv);
				});

				div.css('width', timeToLeftPosition(day.timeEnd) + 420 + 'px');
			}

			drawRoomEvents('Saal 1', dayId + ' .saal1');
			drawRoomEvents('Saal 2', dayId + ' .saal2');
			drawRoomEvents('Saal 3', dayId + ' .saal3');

			var snapTo = [];

			times.sort(function(a, b) {return a.left - b.left;});
			var lastStart = -1;
			$.each(times, function() {
				if(this.start == lastStart) return;
				var label = this.label;

				snapTo.push({
					top: 0,
					left: -this.left + 20,
					snapedIn: function() {
						$(dayId).parent().find('.startTime').text(label);
					},
					start: this.start
				});

				lastStart = this.start;
			});

			var scrollToTime = function(date) {
				var startTime = timeToRelativeTime(date.getHours() + date.getMinutes() / 60);
				var bestEvent = snapTo[0];

				$.each(snapTo, function() {
					if(this.start < startTime) bestEvent = this;
				});

				$(dayId).setWebkitPositionAnimated(bestEvent.left, 0, 700, true);
				bestEvent.snapedIn();
			};

			days.push({scrollToTime: scrollToTime});

			$(dayId).sayHello = function() {
				alert('Hello ' + roomName);
			}

			snapTo[0].snapedIn();

			if($.clientSupportsTouch()) {
				var container = $(dayId).parent();
				container.css('width', (window.innerWidth - 1) + 'px').css('overflow', 'hidden');
				$(dayId).touchScroll({boundingElement: container, direction: 'horizontal', snapTo: snapTo, abortOnWrongDirection: true, kineticDuration: 200});


				window.addEventListener('orientationchange', function() {
					container.css('width', (window.innerWidth - 1) + 'px');
				});
			}
		};

		drawDayEvents(currentyear+'-12-27', '#day1');
		drawDayEvents(currentyear+'-12-28', '#day2');
		drawDayEvents(currentyear+'-12-29', '#day3');
		drawDayEvents(currentyear+'-12-30', '#day4');

		var snapTo = [];
		var dayHeight = 350;
		for(var i = 0; i < 4; i++) {
			snapTo.push({left: 0, top: -dayHeight * i});
		}

		if($.clientSupportsTouch()) {
			var container = $('#scroller');
			container.css('height', window.innerHeight + 'px').css('overflow', 'hidden');
			$('#schedule').css('height', dayHeight * 4 + window.innerWidth * 2 + 'px')
						.touchScroll({boundingElement: container, direction: 'vertical', abortOnWrongDirection: true, snapTo: snapTo, kineticDuration: 400});

			window.addEventListener('orientationchange', function() {
				container.css('height', window.innerHeight + 'px');
			});
		}

		if(!$.clientSupportsTouch()) {
			$('#now').hide();
		} else {
			var scrollToTime = function(time) {
				var start = new Date(currentyear, 12-1, 27);
				var end = new Date(currentyear, 12-1, 31);
				if((time < start) || (time > end)) {
					time.setYear(currentyear);
					time.setMonth(12-1);
					time.setDate(27);
				}

				var day = time.getDate() - 27;
				$('#schedule').setWebkitPositionAnimated(0, -dayHeight * day, 400, true);
				$.each(days, function() {
					this.scrollToTime(time);
				});
			};

			var scrollToNow = function() {
				scrollToTime(new Date());
			}

			$('#now').click(scrollToNow);
			scrollToNow();
		}
	};

	var scheduleJson = localStorage.getItem('schedule');
	if(scheduleJson) {
		drawSchedule(JSON.parse(scheduleJson));
	}

	$.getJSON('json/lastUpdate.json', function(lastUpdate) {
		if(lastUpdate != localStorage.getItem('lastUpdate')) {
			localStorage.setItem('lastUpdate', lastUpdate);

			$.get('json/schedule.en.json', function(data) {
				localStorage.setItem('schedule', data);
				document.location.reload();
			});
		}
	});
});
