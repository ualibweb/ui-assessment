import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import createHslString from '../functions/create-hsl-string';

export default class CollectionsByMaterialTypeReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    titlesShouldBeUsed: PropTypes.bool.isRequired,
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

  // Initializes properties.
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  componentDidUpdate() {
    const collectionsByMaterialType = this.props.resources.collectionsByMaterialType;

    if (collectionsByMaterialType !== null && collectionsByMaterialType.hasLoaded) {
      // FIXME: Remove.
      console.log(collectionsByMaterialType.records);

      const chart = this.chart;
      const titlesOrVolumes = this.props.titlesShouldBeUsed ? 'titles' : 'volumes';
      const hueStep = 360 / (collectionsByMaterialType.records.length);

      // Start fresh.
      const labels = [];
      const datasetData = [];
      const backgroundColor = [];
      const borderColor = [];

      collectionsByMaterialType.records.forEach((materialType, i) => {
        const hue = i * hueStep;
        let count = 0;

        // Sum the counts of the titles or volumes in the specified libraries.
        this.props.libraries.forEach(library => {
          const libraryCounts = materialType.counts[library];

          if (libraryCounts !== undefined) {
            count += libraryCounts[titlesOrVolumes];
          }
        });

        labels.push(materialType.name);
        datasetData.push(count);
        backgroundColor.push(createHslString(hue, 0.5));
        borderColor.push(createHslString(hue, 0.75));
      });

      if (chart === undefined) {
        this.chart = new Chart(this.canvasRef.current, {
          type: 'horizontalBar',
          data: {
            labels,
            datasets: [{
              data: datasetData,
              backgroundColor,
              borderColor,
              borderWidth: 1
            }]
          },
          options: {
            title: {
              display: true,
              text: 'Collections by Material Type'
            },
            legend: {
              display: false
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
        const data = chart.data;
        const dataset = data.datasets[0];

        data.labels = labels;
        dataset.data = datasetData;
        dataset.backgroundColor = backgroundColor;
        dataset.borderColor = borderColor;

        chart.update();
      }
    }
  }

  render() {
    return <canvas ref={this.canvasRef} />;
  }
}
