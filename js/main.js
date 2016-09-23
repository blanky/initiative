var creature_list = [];
var cont_a = {};
var cont_b = {};
var timer = 0;

$(document).ready(function() {
	$('#add-button').click(function() {
		$('#creature-name').val('');
		$('#creature-initiative').val('');
		$('#creature-player-character').prop('checked', false);
		$('#creature-lair-action').prop('checked', false);
	});
	$('#add-creature-button').click(function() {
		//check if there's stuff in the forms
		if($('#creature-initiative').val() === "" || $('#creature-name').val() === "") {
			alert("Do it properly, you shit.");
			return;
		}
		//check if stuff in forms is valid
		if(parseInt($('#creature-initiative').val()) === NaN) {
			alert("No seriously, this isn't hard. Do it properly.");
			return;
		}
		//add it to the list
		var initObj = {};
		initObj.name = $('#creature-name').val();
		initObj.initiative = parseInt($('#creature-initiative').val());
		initObj.highlight = false;
		initObj.pc = $('#creature-player-character').is(':checked');
		creature_list.push(initObj);
		if($('#creature-lair-action').is(':checked')) {
			var lairObj = {};
			lairObj.name = $('#creature-name').val() + ' (Lair action)';
			lairObj.initiative = 20;
			lairObj.highlight = false;
			lairObj.pc = $('#creature-player-character').is(':checked');
			creature_list.push(lairObj);
		}
		//hide modal
		$('#addModal').modal('hide');
		//check against creature_list to see if there's conflicting initiatives
		setTimeout(function(){
		    checkForInitiativeConflict();
		}, 500);
		//sort the list
		//render the list
	});
	$('#contestant-a-button').click(function(){
		changeInitiative(cont_a);
		$('#conflictModal').modal('hide');
		setTimeout(function(){
		    checkForInitiativeConflict();
		}, 500);
	});
	$('#contestant-b-button').click(function() {
		changeInitiative(cont_b);
		$('#conflictModal').modal('hide');
		setTimeout(function(){
		    checkForInitiativeConflict();
		}, 500);
	});
	//hidden button that clicks when initiative resolved
	$('#hidden-button').click(function() {
		creature_list.sort(function(a,b) {return b.initiative - a.initiative});
		renderList();
	});
	$('#clrall-button').click(function() {
		var x = confirm("Are you sure you want to delete the list? WARNING: This will remove marked player characters as well.");
		if(x) {
			clearList();
			renderList();
		}
	});
	$('#clrnpc-button').click(function() {
		var x = confirm("Are you sure you want to delete the NPCs from the list?");
		if(x) {
			clearNPCs();
			renderList();
		}
	});
	
	$('#nxt-button').click(function() {
		setHighlightToNext();
		renderList();
	});
	$('#top-button').click(function() {
		setHighlightToZero();
		renderList();
	});
	
	//timer click functions
	$('#thirty').click(function() {
		timer += 30;
		updateTime();
	});
	$('#sixty').click(function() {
		timer += 60;
		updateTime();
	});
	$('#ninety').click(function() {
		timer += 90;
		updateTime();
	});
	$('#clear').click(function() {
		timer = 0;
		updateTime();
	});
	setInterval(timingFunction, 1000);
});

function timingFunction() {
	if(timer > 0) {
		timer -= 1;
	}
	updateTime();
}

function updateTime() {
	minutes = Math.floor(timer/60).toString();
	if(minutes.length < 2) {
		minutes = '0' + minutes;
	}
	seconds = timer % 60;
	seconds = seconds.toString();
	if(seconds.length < 2) {
		seconds = '0' + seconds;
	}
	$('#timer').text(minutes+':'+seconds);
}


//TODO: Implement search as a BST
function checkForInitiativeConflict() {
	//scan list for conflicting initiatives
	for(var i = 0; i < creature_list.length; i++) {
		for(var j = 0; j < creature_list.length; j++) {
			if(creature_list[j].initiative === creature_list[i].initiative && i !== j) {
				cont_a = creature_list[i];
				cont_b = creature_list[j];
				$('#contestant-a-button').text(cont_a.name);
				$('#contestant-b-button').text(cont_b.name);
				$('#conflictModal').modal('show');
				return;
			}
		}
	}
	$('#hidden-button').click();
}


function changeInitiative(initObj) {
	for(var i = 0; i < creature_list.length; i++) {
		if(creature_list[i].name === initObj.name) {
			creature_list[i].initiative += 0.01;
			break;
		}
	}
}

function setHighlightToNext() {
	var changeHighlight = false;
	creature_list.forEach(function(currentValue, index) {
		if(currentValue.highlight) {
			changeHighlight = true;
			currentValue.highlight = false;
			//case if last one is highlighted
			if(index == creature_list.length - 1) {
				creature_list[0].highlight = true;
			}
		} else if(changeHighlight) {
			currentValue.highlight = true;
			changeHighlight = false;
		}
	});
}

function setHighlightToZero() {
	creature_list.forEach(function(currentValue) {
		currentValue.highlight = false;
	});
	creature_list[0].highlight = true;
}

function clearNPCs() {
	index = creature_list.length - 1;
	while(index >= 0) {
		if(!creature_list[index].pc) {
			creature_list.splice(index, 1);
		}
		index -= 1;
	}
}

function clearList() {
	creature_list = [];
}

function removeFromList(indesu) {
	if((creature_list[indesu]).highlight) {
		setHighlightToNext();
	}
	creature_list.splice(indesu, 1);
}

function renderList() {
	$('#table-list').html('<thead><tr id=\"top-row\"><th id=\"pc-column\" class=\"col-sm-1 center-column\">PC?</th><th id=\"name-column\" class=\"col-sm-7\">Name</th><th id=\"init-column\" class=\"col-sm-3 center-column\">Initiative</th><th id=\"remove-column\" class=\"col-sm-1 center-column\">Remove</th></tr></thead><tbody>');
	creature_list.forEach(function(currentValue, index) {
		$('#table-list').append('<tr id=\"row' + index.toString() + '\" class=\"'
		+ (currentValue.highlight ? 'danger' : '') + '\">'
		+ '<td class=\"center-column\"><input type=\"checkbox\" value=\"\" class=\"pc-tickbox\"'
		+ (currentValue.pc ? ' checked=\"checked\" ' : ' ') + '/></td>'
		+ '<td>'+currentValue.name+'</td>'+'<td class=\"center-column initiative\">'+currentValue.initiative.toFixed(0).toString()+'</td>'
		+ '<td class=\"center-column\"><span class=\"fa fa-remove fa-fw remove-el\"></span></td>' + '</tr>');
	});
	$('#table-list').append('</tbody>')
	$('.pc-tickbox').each(function() {
		$(this).change(function() {
			index = parseInt($(this).parent().parent().index());
			creature_list[index].pc = $(this).is(':checked');
		});
	});
	$('.initiative').each(function() {
		$(this).click(function(){
			index = parseInt($(this).parent().index());
			$(this).html('<input type=\"text\" placeholder=\"' + creature_list[index].initiative.toFixed(0).toString() + '\" id=\"changeInit\">');
			$('#changeInit').focus();
			$('#changeInit').blur(function(){
				index = parseInt($(this).parent().parent().index());
				$(this).parent().text(creature_list[index].initiative.toFixed(0).toString());
			});
			$('#changeInit').keypress(function(e) {
				if(e.which == 13) {
					if($(this).val() === '') {
						$(this).blur();
					}else if(isNaN(parseInt($(this).val()))) {
						$(this).val('');
					} else {
						console.log($(this).val());
						index = $(this).parent().parent().index();
						creature_list[index].initiative = parseInt($(this).val());
						checkForInitiativeConflict();
						return false;
					}
				}
			});
		});
	});
	$('.remove-el').each(function() {
		$(this).click(function() {
			index = parseInt($(this).parent().parent().index());
			removeFromList(index);
			renderList();
		});
	});
	
}