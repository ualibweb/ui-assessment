import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import createHslString from '../functions/create-hsl-string';
import circulationTypes from '../json/circulation-types.json';

export default class CirculationByPatronGroupReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
    resources: PropTypes.shape({
      circulationByPatronGroup: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    circulationByPatronGroup: {
      type: 'okapi',
      path: 'assessment/circulation-by-patron-group?from=!{from}&to=!{to}'
    }
  };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidUpdate() {
    const circulationByPatronGroup = this.props.resources.circulationByPatronGroup;

    if (circulationByPatronGroup !== null && circulationByPatronGroup.hasLoaded) {
      const patronGroups = circulationByPatronGroup.records;
      const types = this.props.types;
      const hueStep = 360 / types.length;
      const chart = this.chart;
      const labels = patronGroups.map(patronGroup => patronGroup.name);
      const datasets = [];

      types.forEach((type, i) => {
        const data = [];
        const hue = i * hueStep;

        patronGroups.forEach(patronGroup => {
          let count = 0;

          // Sum the counts.
          this.props.libraries.forEach(library => {
            const libraryCounts = patronGroup.counts[library];

            if (libraryCounts !== undefined) {
              count += libraryCounts[type];
            }
          });

          data.push(count);
        });

        datasets.push({
          label: circulationTypes[type].text,
          data,
          backgroundColor: createHslString(hue, 0.5),
          borderColor: createHslString(hue, 0.75),
          borderWidth: 1,
        });
      });

      if (chart === undefined) {
        this.chart = new Chart(this.canvasRef.current, {
          type: 'horizontalBar',
          data: {
            labels,
            datasets,
          },
          options: {
            title: {
              display: true,
              text: 'Circulation by Patron Group'
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        });
      } else {
        chart.data = {
          labels,
          datasets,
        };

        chart.update();
      }
    }
  }

  render() {
    return <canvas ref={this.canvasRef} />;
  }
};
