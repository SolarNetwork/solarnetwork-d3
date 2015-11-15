import "ui";

sn.ui.colorDataLegendTable = sn_ui_colorDataLegendTable;

function sn_ui_colorDataLegendTable(containerSelector, colorData, clickHandler, labelRenderer) {
	// add labels based on available sources
	var table = d3.select(containerSelector).selectAll('table').data([0]);
	table.enter().append('table').append('tbody');
	
	var labelTableRows = table.select('tbody').selectAll('tr').data(colorData);
	
	var newLabelTableRows = labelTableRows.enter().append('tr');
	
	labelTableRows.exit().remove();
			
	if ( clickHandler ) {
		// attach the event handler for 'click', and add the 'clickable' class
		// so can be styled appropriately (e.g. cursor: pointer)
		newLabelTableRows.on('click', clickHandler).classed('clickable', true);
	}
	
	if ( labelRenderer === undefined ) {
		// default way to render labels is just a text node
		labelRenderer = function(s) {
			s.text(Object);
		};
	}	
	var swatches = labelTableRows.selectAll('td.swatch')
		.data(function(d) { return [d.color]; })
			.style('background-color', Object);
	swatches.enter().append('td')
				.attr('class', 'swatch')
				.style('background-color', Object);
	swatches.exit().remove();
			
	var descriptions = labelTableRows.selectAll('td.desc')
		.data(function(d) { return [(d.source === '' ? 'Main' : d.source)]; })
			.call(labelRenderer);
	descriptions.enter().append('td')
			.attr('class', 'desc')
			.call(labelRenderer);
	descriptions.exit().remove();
};
