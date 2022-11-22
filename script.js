// console.log(js_chart_name);
// console.log(js_canvas_id);
// console.log(js_x_labels);
// console.log(js_data_recorde);
// console.log(js_bar_value_display);

  // Font
  // Chart.defaults.font.family = "'ヒラギノ丸ゴ Pro W4', 'ヒラギノ丸ゴ Pro', 'Hiragino Maru Gothic Pro', sans-serif";
  // Chart.defaults.font.size = 12;

  // Setup Block
  const canvas_id     = js_canvas_id;
  const x_labels      = js_x_labels;
  const data_recorde  = js_data_recorde;
  const data = {
    labels: x_labels,
    datasets: data_recorde,
  }

  // Data Label Setting
  const datalabel = {
    anchor: 'end',
    align: 'top',
    color: 'black',
    display: false,
  }

  // Tooltip Setting
  const tooltips = {
    mode: 'index', // Tooltipにまとめる
    position: 'average',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 1)',
    padding: 15,
    itemSort: function(a, b) {
      // console.log(a.datasetIndex);
      return b.datasetIndex - a.datasetIndex;
    },
  }

  // Plugin - TopLabels
  const topLabels = {
    id: 'topLabels',
    afterDatasetsDraw: function (chart, args, pluginOptions) {
      const { ctx, scales: {x, y} } = chart;

      chart.data.datasets[0].data.forEach((datapoint, index) => {
        const datasetArray = [];

        chart.data.datasets.forEach((dataset, i) => {
          if(chart.getDatasetMeta(i).hidden) {
            return;
          }
          datasetArray.push(dataset.data[index])
        })
        // console.log('datasetArray:', datasetArray);

        // sum array
        function totalSum(total, values) {
          return Number(total) + Number(values);
        };

        let sum = datasetArray.reduce(totalSum, 0);
        sum = sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        ctx.font = 'bold 12px Helvetica Neue';
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.textAlign = 'center';

        let y = 0;
        for (let i = 0; i < data.datasets.length; i++) {
          const meta = chart.getDatasetMeta(i);
          // console.log(meta, chart.legend)
          if (meta.hidden ||
            (y !== 0 && y < meta.data[index].y)) {
            continue;
          }
          y = meta.data[index].y;
        }
        const fontSize = 12;
        const margin = 10;
        ctx.fillText(
          sum,
          x.getPixelForValue(index),
          y === 0
            ? chart.height - (chart.legend.bottom + chart.legend.top - fontSize + margin)
            : y - margin
        );

      })
    }
  }

  // Config block
  const config = {
    type: 'bar',
    data,
    options: {
      maintainAspectRatio: false, // サイズ変更時、元のキャンバスのアスペクト比を維持
      scales: {
        x: {
          stacked: true,
          grid: {
            // drawOnChartArea: false, // 仕切り線
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          // grace: 10,
        },
      },
      plugins: {
        datalabels: datalabel,
        tooltip: tooltips,
        legend: {
          display: false // 上部のラベルを非表示
        }
      },
      layout: {
        padding: {
          top: 30,
          bottom: 20
        }
      }
    },
    plugins: [ChartDataLabels, topLabels]
    // plugins: [ChartDataLabels]
  }

  // render block
  const mychart = new Chart(
    document.getElementById(js_canvas_id),
    config
  );

  /**
   * CustomしたlabelをCanvasの下に作る
   */
  function generateLegend(){
    // get the selected location.
    const chartBox = document.querySelector('.graph-area');
    // create div
    const div = document.createElement('DIV');
    div.setAttribute('id', 'customLegend');
    chartBox.appendChild(div);

    // create UL
    const ul = document.createElement('UL');

    mychart.legend.legendItems.forEach((dataset, index) => {
      const text = dataset.text;
      const datasetIndex = dataset.datasetIndex;
      const bgColor = dataset.fillStyle;
      const bColor = dataset.strokeStyle;
      const fontColor = dataset.fontColor;

      // create li in foreach loop
      const li = document.createElement('LI');
      // span colorbox
      const spanBox = document.createElement('SPAN');
      spanBox.style.borderColor = bColor;
      spanBox.style.backgroundColor = bgColor;

      // p + text
      const p = document.createElement('P');
      const textNode = document.createTextNode(text);

      li.onclick = (click) => {
        const isHidden = !mychart.isDatasetVisible(datasetIndex);
        mychart.setDatasetVisibility(datasetIndex, isHidden);
        updateLegend(click);
      }

      ul.appendChild(li);
      li.appendChild(spanBox);
      li.appendChild(p);
      p.appendChild(textNode);
    });

    // insert div into chartBox
    chartBox.appendChild(div);
    div.appendChild(ul);
  }

  function updateLegend(click) {
    const element = click.target.parentNode;
    element.classList.toggle('fade');
    mychart.update();
  }

  generateLegend(); // initial load
