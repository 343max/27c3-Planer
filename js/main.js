$().ready(function() {
	var hourWidth = 180;
	var position = 0;
	var currentTime = 0;
	if(window.innerWidth <= 320) {
		hourWidth = (window.innerWidth - 40) / 2;
	}

	var favedEvents = JSON.parse(localStorage.getItem('favedEvents'));
	if(!favedEvents) favedEvents = {};

	$.getJSON('json/schedule.en.json', function(data) {
		var schedule = new Schedule(data.schedule);
		console.dir(schedule.schedule);

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

					/* eventDiv.append($('<p>').addClass('description').text(this.description));
					eventDiv.append($('<p>').addClass('abstract').text(this.abstract)); */

					/* eventDiv.click(function() {
						var $this = $(this);

						if($this.hasClass('fullsize')) {
							$this.removeClass('fullsize');
						} else {
							$('div.event').removeClass('fullsize');
							$this.addClass('fullsize');
						}
					}); */

					div.append(eventDiv);
				});

				div.css('width', timeToLeftPosition(day.timeEnd) + 420 + 'px');
			}

			drawRoomEvents('Saal 1', dayId + ' .saal1');
			drawRoomEvents('Saal 2', dayId + ' .saal2');
			drawRoomEvents('Saal 3', dayId + ' .saal3');

			var snapTo = [];

			times.sort(function(a, b) {return a.left - b.left;});
			var lastStart = -1000;
			$.each(times, function() {
				if(this.start == lastStart) return;
				lastStart = this.start;
				var timeLabel = $('<div>').addClass('time').text(this.label).css('left', this.left + 'px');
				$(dayId + ' .times').append(timeLabel);
				
				snapTo.push({
					top: 0,
					left: -this.left + 20,
					snapedIn: function() {
						$('.time').removeClass('active');
						timeLabel.addClass('active');
					}
				});
			});

			snapTo[0].snapedIn();

			var container = $(dayId).parent();
			container.css('width', (window.innerWidth - 1) + 'px').css('overflow', 'hidden');
			$(dayId).touchScroll({boundingElement: container, direction: 'horizontal', snapTo: snapTo, abortOnWrongDirection: true, kineticDuration: 200});
		};

		drawDayEvents('2010-12-27', '#day1');
		drawDayEvents('2010-12-28', '#day2');
		drawDayEvents('2010-12-29', '#day3');
		drawDayEvents('2010-12-30', '#day4');

		var snapTo = [];
		var dayHeight = 350;
		for(var i = 0; i < 4; i++) {
			snapTo.push({left: 0, top: -dayHeight * i});
		}

		var container = $('#scroller');
		container.css('height', window.innerHeight + 'px').css('overflow', 'hidden');
		$('#schedule').css('height', dayHeight * 4 + 600 + 'px').touchScroll({boundingElement: container, direction: 'vertical', abortOnWrongDirection: true, snapTo: snapTo, kineticDuration: 900});
	});
});
