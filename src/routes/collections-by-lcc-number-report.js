import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';

export default class CollectionsByLCCNumberReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    titlesShouldBeUsed: PropTypes.bool.isRequired,
    resources: PropTypes.shape({
      collectionsByLCCNumber: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        loadedAt: PropTypes.instanceOf(Date),
        records: PropTypes.array.isRequired
      })
    }).isRequired
  };

  static manifest = {
    collectionsByLCCNumber: {
      type: 'okapi',
      path: 'assessment/collections-by-lcc-number'
    }
  };

  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  createHslString(hue, alpha) {
    return `hsl(${hue}, 100%, 70%, ${alpha})`;
  }

  render() {
    const collectionsByLCCNumber = this.props.resources.collectionsByLCCNumber;

    if (collectionsByLCCNumber !== null && collectionsByLCCNumber.hasLoaded) {
      const mainClasses = collectionsByLCCNumber.records;
      const titlesOrVolumes = this.props.titlesShouldBeUsed ? 'titles' : 'volumes';
      const hueStep = 360 / (collectionsByLCCNumber.records.length - 1);
      const labels = [];
      const data = [];
      const backgroundColor = [];
      const borderColor = [];
      const titles = [];

      // Populate the arrays.
      mainClasses.forEach((mainClass, i) => {
        const hue = i * hueStep;
        let count = 0;

        // Sum the counts of the titles or volumes in the specified libraries.
        this.props.libraries.forEach(library => {
          if (mainClass.counts[library] !== undefined) count += mainClass.counts[library][titlesOrVolumes];
        });

        labels.push(mainClass.letter);
        data.push(count);
        backgroundColor.push(this.createHslString(hue, 0.5));
        borderColor.push(this.createHslString(hue, 0.75));
        titles.push(mainClass.caption);
      });

      new Chart(this.chartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
            titles
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Collections by LCC Number'
          },
          legend: {
            display: false
          },
          tooltips: {
            callbacks: {
              title: ([tooltipItem], data) => data.datasets[tooltipItem.datasetIndex].titles[tooltipItem.index]
            }
          }
        }
      });
    }

    return <canvas ref={this.chartRef} />;
  }
}
