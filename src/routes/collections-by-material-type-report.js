import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { Button, Row, Col } from '@folio/stripes/components';
import createHslString from '../functions/create-hsl-string';
import collectionTypes from '../json/collection-types.json';

export default class CollectionsByMaterialTypeReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
    resources: PropTypes.shape({
      collectionsByMaterialType: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    collectionsByMaterialType: {
      type: 'okapi',
      path: 'assessment/collections-by-material-type'
    }
  };

  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.doughnutChartCanvasRefs = {};
    this.doughnutCharts = {};
    this.handleDownloadDataButtonClick = this.handleDownloadDataButtonClick.bind(this);

    Object.keys(collectionTypes).forEach(collectionType => {
      this.doughnutChartCanvasRefs[collectionType] = React.createRef();
    });
  }

  componentDidUpdate() {
    const collectionsByMaterialType = this.props.resources.collectionsByMaterialType;

    if (collectionsByMaterialType !== null && collectionsByMaterialType.hasLoaded) {
      const materialTypes = collectionsByMaterialType.records;
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
          label: collectionTypes[type].text,
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
            datasets
          },
          options: {
            title: {
              display: true,
              text: 'Collections by Material Type'
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

      const doughnutChartHueStep = 360 / materialTypes.length;
      const backgroundColor = [];

      for (let i = 0; i < materialTypes.length; ++i) {
        backgroundColor.push(createHslString(i * doughnutChartHueStep, 1.0));
      }

      this.props.types.forEach((type, i) => {
        if (this.doughnutCharts[type] === undefined) {
          this.doughnutCharts[type] = new Chart(this.doughnutChartCanvasRefs[type].current, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [{
                label: datasets[i].label,
                data: datasets[i].data,
                backgroundColor
              }]
            },
            options: {
              title: {
                display: true,
                text: collectionTypes[type].text
              }
            }
          });
        } else {
          this.doughnutCharts[type].data = {
            labels,
            datasets:[{
              label: datasets[i].label,
              data: datasets[i].data,
              backgroundColor
            }]
          };

          this.doughnutCharts[type].update();
        }
      });
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
    a.download = 'collections-by-material-type.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }


  render() {
    const collectionsByMaterialType = this.props.resources.collectionsByMaterialType;
    const doughnutChartCanvases = Object.keys(collectionTypes).map((collectionType, i) => <canvas ref={this.doughnutChartCanvasRefs[collectionType]} key={i} />);

    return (
      <React.Fragment>
        <canvas ref={this.canvasRef} />
        {doughnutChartCanvases}
        <Button disabled={collectionsByMaterialType === null || !collectionsByMaterialType.hasLoaded} onClick={this.handleDownloadDataButtonClick}>Download Data</Button>
      </React.Fragment>
    );
  }
};
