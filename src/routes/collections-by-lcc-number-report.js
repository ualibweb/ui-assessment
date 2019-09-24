import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { Button } from '@folio/stripes/components';
import createHslString from '../functions/create-hsl-string';
import collectionTypes from '../json/collection-types.json';

export default class CollectionsByLCCNumberReport extends React.Component {
  static propTypes = {
    libraries: PropTypes.arrayOf(PropTypes.string).isRequired,
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
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

  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.state = {
      mainClass: null
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.handleDownloadDataButtonClick = this.handleDownloadDataButtonClick.bind(this);
  }

  componentDidUpdate() {
    const collectionsByLCCNumber = this.props.resources.collectionsByLCCNumber;

    if (collectionsByLCCNumber !== null && collectionsByLCCNumber.hasLoaded) {
      const types = this.props.types;
      const hueStep = 360 / types.length;
      const chart = this.chart;

      let mainClassesOrSubclasses;
      let labelKey;

      if (this.state.mainClass === null) {
        mainClassesOrSubclasses = collectionsByLCCNumber.records;
        labelKey = 'letter';
      } else {
        mainClassesOrSubclasses = this.state.mainClass.subclasses;
        labelKey = 'letters';
      }

      const labels = [];
      const datasets = [];
      const tooltipTitles = [];

      mainClassesOrSubclasses.forEach(mainClassOrSubclass => {
        labels.push(mainClassOrSubclass[labelKey]);
        tooltipTitles.push(mainClassOrSubclass.caption);
      });

      types.forEach((type, i) => {
        const data = [];
        const hue = i * hueStep;

        mainClassesOrSubclasses.forEach(mainClassOrSubclass => {
          let count = 0;

          // Sum the counts.
          this.props.libraries.forEach(library => {
            const libraryCounts = mainClassOrSubclass.counts[library];

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
          borderColor: createHslString(hue, 0.7),
          borderWidth: 1,
        });
      });

      if (chart === undefined) {
        this.chart = new Chart(this.canvasRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets,
            tooltipTitles
          },
          options: {
            title: {
              display: true,
              text: 'Collections by LCC Number'
            },
            tooltips: {
              callbacks: {
                title: ([{index}], {tooltipTitles}) => tooltipTitles[index]
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
        chart.data = {
          labels,
          datasets,
          tooltipTitles
        };

        chart.update();
      }
    }
  }

  handleBackButtonClick() {
    this.setState({
      mainClass: null
    });
  }

  handleDownloadDataButtonClick() {
    const chartData = this.chart.data;
    let csv =  (this.state.mainClass === null ? 'main_class_letter' : 'subclass_letter') + ',caption,' + this.props.types.toString() + '\n';

    for (let i = 0; i < chartData.labels.length; ++i) {
      csv += chartData.labels[i] + ',"' + chartData.tooltipTitles[i] + '"';

      for (let j = 0; j < chartData.datasets.length; ++j) {
        csv += ',' + chartData.datasets[j].data[i];
      }

      csv += '\n';
    }

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'collections-by-lcc-number.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  render() {
    const collectionsByLCCNumber = this.props.resources.collectionsByLCCNumber;

    return (
      <React.Fragment>
        <canvas ref={this.canvasRef} />
        <Button disabled={this.state.mainClass === null} onClick={this.handleBackButtonClick}>Back</Button>
        <Button disabled={collectionsByLCCNumber === null || !collectionsByLCCNumber.hasLoaded} onClick={this.handleDownloadDataButtonClick}>Download Data</Button>
      </React.Fragment>
    );
  }
};
