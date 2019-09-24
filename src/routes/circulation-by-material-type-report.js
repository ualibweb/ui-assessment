import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { Button } from '@folio/stripes/components';
import createHslString from '../functions/create-hsl-string';
import circulationTypes from '../json/circulation-types.json';

export default class CirculationByMaterialTypeReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
    resources: PropTypes.shape({
      circulationByMaterialType: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    circulationByMaterialType: {
      type: 'okapi',
      path: 'assessment/circulation-by-material-type?from=!{from}&to=!{to}'
    }
  };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.handleDownloadDataButtonClick = this.handleDownloadDataButtonClick.bind(this);
  }

  componentDidUpdate() {
    const circulationByMaterialType = this.props.resources.circulationByMaterialType;

    if (circulationByMaterialType !== null && circulationByMaterialType.hasLoaded) {
      const materialTypes = circulationByMaterialType.records;
      const types = this.props.types;
      const hueStep = 360 / types.length;
      const chart = this.chart;
      const labels = materialTypes.map(materialType => materialType.name);
      const datasets = [];

      types.forEach((type, i) => {
        const data = [];
        const hue = i * hueStep;

        materialTypes.forEach(materialType => {
          let count = 0;

          // Sum the counts.
          this.props.libraries.forEach(library => {
            const libraryCounts = materialType.counts[library];

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
              text: 'Circulation by Material Type'
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

  handleDownloadDataButtonClick() {
    const chartData = this.chart.data;
    let csv =  'material_type,' + this.props.types.toString() + '\n';

    for (let i = 0; i < chartData.labels.length; ++i) {
      csv += chartData.labels[i];

      for (let j = 0; j < chartData.datasets.length; ++j) {
        csv += ',' + chartData.datasets[j].data[i];
      }

      csv += '\n';
    }

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'circulation-by-material-type.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  render() {
    const circulationByMaterialType = this.props.resources.circulationByMaterialType;

    return (
      <React.Fragment>
        <canvas ref={this.canvasRef} />
        <Button disabled={circulationByMaterialType === null || !circulationByMaterialType.hasLoaded} onClick={this.handleDownloadDataButtonClick}>Download Data</Button>
      </React.Fragment>
    );
  }
};
