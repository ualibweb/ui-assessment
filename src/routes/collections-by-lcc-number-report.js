import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { Button } from '@folio/stripes/components';

export default class CollectionsByLCCNumberReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    titlesShouldBeUsed: PropTypes.bool.isRequired,
    resources: PropTypes.shape({
      collectionsByLCCNumber: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
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

  // Initializes properties and binds an event handler.
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.state = {
      mainClass: null
    };

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  componentDidUpdate() {
    const collectionsByLCCNumber = this.props.resources.collectionsByLCCNumber;

    if (collectionsByLCCNumber !== null && collectionsByLCCNumber.hasLoaded) {
      const chart = this.chart;
      const titlesOrVolumes = this.props.titlesShouldBeUsed ? 'titles' : 'volumes';
      const hueStep = 360 / (collectionsByLCCNumber.records.length - 1);

      // Start fresh.
      const labels = [];
      const datasetData = [];
      const backgroundColor = [];
      const borderColor = [];
      const titles = [];

      let mainClassesOrSubclasses;
      let labelKey;

      if (this.state.mainClass === null) {
        mainClassesOrSubclasses = collectionsByLCCNumber.records;
        labelKey = 'letter';
      } else {
        mainClassesOrSubclasses = this.state.mainClass.subclasses;
        labelKey = 'letters';
      }

      mainClassesOrSubclasses.forEach((mainClassOrSubclass, i) => {
        const hue = i * hueStep;
        let count = 0;

        // Sum the counts of the titles or volumes in the specified libraries.
        this.props.libraries.forEach(library => {
          if (mainClassOrSubclass.counts[library] !== undefined) {
            count += mainClassOrSubclass.counts[library][titlesOrVolumes];
          }
        });

        labels.push(mainClassOrSubclass[labelKey]);
        datasetData.push(count);
        backgroundColor.push(this.createHslString(hue, 0.5));
        borderColor.push(this.createHslString(hue, 0.75));
        titles.push(mainClassOrSubclass.caption);
      });

      if (chart === undefined) {
        this.chart = new Chart(this.canvasRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              data: datasetData,
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
                title: ([tooltipItem], {datasets}) => datasets[tooltipItem.datasetIndex].titles[tooltipItem.index]
              }
            },
            onClick: (event, [activeElement]) => {
              if (this.state.mainClass === null) {
                this.setState({
                  mainClass: this.props.resources.collectionsByLCCNumber.records[activeElement._index]
                });
              }
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
        dataset.titles = titles;

        chart.update();
      }
    }
  }

  createHslString(hue, alpha) {
    return `hsl(${hue}, 100%, 70%, ${alpha})`;
  }

  handleButtonClick() {
    this.setState({
      mainClass: null
    });
  }

  render() {
    return (
      <React.Fragment>
        <canvas ref={this.canvasRef} />
        <Button disabled={this.state.mainClass === null} onClick={this.handleButtonClick}>Back</Button>
      </React.Fragment>
    );
  }
}
