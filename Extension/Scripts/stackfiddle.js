;jQuery.noConflict();
jQuery(function($,undefined){

	// Get the tags and decide whether or not to add the headers to the code
	chrome.extension.sendRequest({'method':'gettags'}, function(response)
	{
		var postTags = $(".post-taglist .post-tag").map(function(){ return $(this).text();}),
			tagApplies = (function(pageTags,myTags){ 			
							for(var i=0;i<pageTags.length;i++){ 
								if($.inArray(pageTags[i], myTags)>-1){
									return true;
								}
							}
						 }(postTags, response.value.split(',')));
						 
		if(tagApplies){
			applyStackFiddle();
		}
	});

	function applyStackFiddle(){
		// This is the form that is posted to jsFiddle. It is not added to the DOM
		var $fiddleForm = $("<form action='http://jsfiddle.net/api/post/' id='stackfiddle-fiddleform' method='post' target='_blank' style='display:none'><input type='hidden' id='stackfiddle-html' name='html' /><input type='hidden' id='stackfiddle-js' name='js' /><input type='hidden' id='stackfiddle-css' name='css' /><input type='hidden' id='stackfiddle-title' name='title' /><input type='hidden' id='stackfiddle-description' name='description' /><input type='hidden' id='stackfiddle-framework' name='framework' /><input type='hidden' id='stackfiddle-framework-version' name='version' /></form>"),
			$headerDiv = $("<div class='stackfiddle-header'><span>Fiddle as: <a href='#' class='stackfiddle-choice stackfiddle-html' data-option='html'>HTML</a> | <a href='#' class='stackfiddle-choice stackfiddle-js' data-option='js'>JavaScript</a> | <a href='#' class='stackfiddle-choice stackfiddle-css' data-option='css'>CSS</a><a href='#' class='stackfiddle-submit'>Send to jsFiddle</a></span></div>");
		
		// Get the preferred framework
		chrome.extension.sendRequest({'method':'getlocal', 'param':'options-framework'}, function(response)
		{
			if(response && response.value){
				$("#stackfiddle-framework", $fiddleForm).val(response.value);
			}else{
				$("#stackfiddle-framework", $fiddleForm).val('jQuery');
			}
		});
		
		// Get the preferred version
		chrome.extension.sendRequest({'method':'getlocal', 'param':'options-framework-version'}, function(response)
		{
			if(response && response.value){
				$("#stackfiddle-framework-version", $fiddleForm).val(response.value);
			}else{
				$("#stackfiddle-framework-version", $fiddleForm).val('1.5');
			}
		});

		$("pre code").parent().addClass('stackfiddle-code').before($headerDiv);
		
		$("a.stackfiddle-choice").live('click', function(e){
			e.preventDefault();
				var option = $(this).data('option');
				if($(this).hasClass('stackfiddle-chosen')){
					$("#stackfiddle-" + option, $fiddleForm).val('');
					$(".stackfiddle-choice.stackfiddle-"+option).removeClass('stackfiddle-chosen');
				}else{
					$(".stackfiddle-choice.stackfiddle-"+option).removeClass('stackfiddle-chosen');
					$(this).addClass('stackfiddle-chosen');
					var codeElement = $(this).closest('.stackfiddle-header').next();
					var innerHtml = $(codeElement.html().replace(/<br>/g,'\n')).text();
					$("#stackfiddle-" + option, $fiddleForm).val(innerHtml);
				}
				
			$(".stackfiddle-submit").toggle(
					!!($("#stackfiddle-js",$fiddleForm).val()
					+ $("#stackfiddle-html",$fiddleForm).val()
					+ $("#stackfiddle-css",$fiddleForm).val()));
		});
		
		$("a.stackfiddle-submit").live('click', function(e){
			e.preventDefault();
			var action = 'http://jsfiddle.net/api/post/' +
						$("#stackfiddle-framework", $fiddleForm).val() + '/' +
						$("#stackfiddle-framework-version", $fiddleForm).val() + '/';

			$fiddleForm.attr("action",action);
			$fiddleForm.submit();
		});
		
		$("#stackfiddle-title").val("Fiddle for " + $("#question-header").text().trim());
		$("#stackfiddle-description").val("This fiddle was created using the Stack Fiddle Chrome extension - the Stack Exchange question that was fiddled was: " + document.location.href);
		
		chrome.extension.sendRequest({'method':'getlocal', 'param':'optionsInframe'}, function(response)
		{
			if(response.value == 'true'){
				var $links = $("a").filter(function(index){
					return this.href && this.href.match(/http:\/\/(www\.)?jsfiddle\.net/i);
				});

				$links.each(function(){
					var $item = this,
						$show = $("<a href='#'>[Expand Fiddle]</a>")
						$element = $('<iframe class="stackfiddle-jsfiddleframe" src="'+ this.href +'/embedded/"></iframe>')
						added = false;
						
					$show.toggle(function(){
							if(!added){
								$item.parent().append($element);
								added = true;
							}
							$show.html('[Collapse Fiddle]');
							$element.show();
						},function(){
							$element.hide();
							$show.html('[Expand Fiddle]');
						});
						
					$item.parent().append($show);
				});
			}
		});
	}
		
}(jQuery));