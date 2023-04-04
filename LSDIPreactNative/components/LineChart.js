import React from 'react';
import * as d3 from 'd3';
import { useD3 } from './useD3';
import {
    View,
    Text
} from 'react-native-web';
import colors from '../colors';

export default function LineChart({data}) {
    console.log('line chart');
    /*
    const data = [
        { year: 1980, efficiency: 24.3, sales: 8949000 },
        { year: 1985, efficiency: 27.6, sales: 10979000 },
        { year: 1990, efficiency: 28, sales: 9303000 },
        { year: 1991, efficiency: 28.4, sales: 8185000 },
        { year: 1992, efficiency: 27.9, sales: 8213000 },
        { year: 1993, efficiency: 28.4, sales: 8518000 },
        { year: 1994, efficiency: 28.3, sales: 8991000 },
        { year: 1995, efficiency: 28.6, sales: 8620000 },
        { year: 1996, efficiency: 28.5, sales: 8479000 },
        { year: 1997, efficiency: 28.7, sales: 8217000 },
        { year: 1998, efficiency: 28.8, sales: 8085000 },
        { year: 1999, efficiency: 28.3, sales: 8638000 },
    ];
    */
    const ref = useD3(
        (svg) => {
            const height = 300;
            const width = 700;
            const margin = { top: 10, right: 20, bottom: 20, left: 40 };

            const x = d3.scaleTime()
                .domain(d3.extent(data, (d) => d.month))
                .rangeRound([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.sales)])
                .range([height - margin.bottom, margin.top]);

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .style("color", colors.violet100)
                .call(d3
                    .axisBottom(x)
                    .tickValues(
                        d3
                            .ticks(...d3.extent(x.domain()), width / 40)
                            .filter((v) => x(v) !== undefined)
                    )
                    .tickSizeOuter(0)
                );

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .style("color", colors.violet100)
                .call(d3.axisLeft(y).ticks(null, "s"))
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .append("text")
                        .attr("x", -margin.left)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text(data.y)
                );

            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors.violet400)
                .attr("stroke-width", 3.2)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.month) })
                    .y(function (d) { return y(d.sales) })
                )
            svg
                .select("#my_dataviz")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
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