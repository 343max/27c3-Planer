jQuery.fn.setWebkitPosition = function(x, y) {
	this.css('-webkit-transform', 'translate(' + x + 'px, ' + y + 'px)');
}

jQuery.fn.setWebkitPositionAnimated = function(x, y, duration, timingFunction, callback) {
	if(!duration) duration = 500;
	if(!timingFunction) timingFunction = 'ease-out';

	$this = this;

	$this.css( {
		'-webkit-transition-duration': duration + 'ms',
		'-webkit-transform': 'translate(' + x + 'px, ' + y + 'px)'
	} );

	window.setTimeout(function() {
		$this.css('-webkit-transition-duration', '0');
		if(callback) callback();

	}, duration + 50);
}

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

		var jumpToTime = function(time) {
			currentTime = time;

			$('div.day').setWebkitPositionAnimated(-(time - schedule.schedule.conference.day_change_float) * hourWidth, 0);
		}

		var drawDayEvents = function(day, dayId) {

			var times = {};

			var drawRoomEvents = function(date, roomName, div) {
				div = $(div);

				var day = schedule.schedule.day.byDate(date);
				var events = day.room.byName(roomName).event;

				$.each(events, function() {
					//console.dir(this);

					var slug = this.slug;

					var eventDiv = $('<div>').addClass('event');
					if(favedEvents[slug]) eventDiv.addClass('faved');
					var left = this.start_float;

					if(this.start_float < schedule.schedule.conference.day_change_float) left += 24;

					left -= day.timeStart;

					times[this.start] = {
						left: left,
						label: this.start
					};

					eventDiv.css('left', (left * hourWidth) + 'px').css('width', (hourWidth * this.duration_float) + 'px');

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

					myScroll = new iScroll(dayId, {desktopCompatibility:true});

					div.append(eventDiv);
				});

				div.css('width', (day.timeEnd - day.timeStart) * hourWidth + 20 + 'px');
			}

			drawRoomEvents(day, 'Saal 1', '#' + dayId + ' .saal1');
			drawRoomEvents(day, 'Saal 2', '#' + dayId + ' .saal2');
			drawRoomEvents(day, 'Saal 3', '#' + dayId + ' .saal3');

			$.each(times, function() {
				$('#' + dayId + ' .times').append(
					$('<div>').addClass('time').text(this.label).css('left', this.left * hourWidth + 'px')	
				);
			});
		};

		drawDayEvents('2010-12-27', 'day1');
	});
});
