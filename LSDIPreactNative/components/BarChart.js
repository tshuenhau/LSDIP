import React from 'react';
import * as d3 from 'd3';
import { useD3 } from './useD3';
import { View } from 'react-native-web';
import colors from '../colors';

export default function BarChart({ data }) {
    //console.log(data);
    const ref = useD3(
        (svg) => {
            const height = 300;
            const width = 400;
            const margin = { top: 10, right: 20, bottom: 20, left: 40 };

            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.month))
                .rangeRound([margin.left, width - margin.right])
                .padding(0.6);
        
            {/*const x = d3
                .scaleBand()
                .domain(data.map((d) => d.year))
                .rangeRound([margin.left, width - margin.right])
                .padding(0.6);
            */}

            {
                /* const y1 = d3
                    .scaleLinear()
                    .domain([0, d3.max(data, (d) => d,sales)])
                    .rangeRound([height - margin.bottom, martin.top])
                 */
            }

            const y1 = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.orderAmt)])
                .rangeRound([height - margin.bottom, margin.top]);

            const xAxis = (g) =>
                g.attr("transform", `translate(0,${height - margin.bottom})`)
                    .style("color", colors.shadowGray)
                    .call(
                        d3
                            .axisBottom(x)
                            .tickValues(
                                d3
                                    .ticks(...d3.extent(x.domain()), width / 40)
                                    .filter((v) => x(v) !== undefined)
                            )
                            .tickSizeOuter(0)
                    );
            const y1Axis = (g) =>
                g.attr("transform", `translate(${margin.left},0)`)
                    .style("color", colors.shadowGray)
                    .call(d3.axisLeft(y1).ticks(null, "s"))
                    .call((g) => g.select(".domain").remove())
                    .call((g) =>
                        g
                            .append("text")
                            .attr("x", -margin.left)
                            .attr("y", 10)
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .text(data.y1)
                    );

            svg.select(".x-axis").call(xAxis);
            svg.select(".y-axis").call(y1Axis);

            svg
                .select(".plot-area")
                .attr("fill", colors.orange400)
                .selectAll(".bar")
                .data(data)
                .join("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.month))
                .attr("width", x.bandwidth())
                .attr("y", (d) => y1(d.orderAmt))
                .attr("height", (d) => y1(0) - y1(d.orderAmt));
        },
        [data.length]
    );


    return (
        <View>
            <svg
                ref={ref}
                style={{
                    height: 300,
                    width: "100%",
                    marginRight: "0px",
                    marginLeft: "0px",
                }}
            >
                <g className="plot-area" />
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
        </View>

    )
}