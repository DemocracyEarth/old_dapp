(function () {
    'use strict';
    angular.module('dAppSvrApp').factory('graph', [function () {

        return {
            renderGraph: renderGraph
        }

        /**
         * It will render a delegation graph
         * @param {*} nodesAndEdges list of nodes and edges in the form:
         * { group: "nodes", data: { id: 0, name: "yes", type: "option" } }
         * { group: "edges", data: { id: id, source: 0, target: j } }
         * @param {*} classContainer DOM class where the graph will be visualized
         * @param {*} color Color of the nodes
         */
        function renderGraph(nodesAndEdges, classContainer, color) {

            let cy = cytoscape({
                container: document.getElementsByClassName(classContainer), // container to render in
                elements: nodesAndEdges,

                style: [ // the stylesheet for the graph
                    {
                        selector: 'node',
                        style: {
                            'background-color': color,
                            'label': 'data(name)',
                            'font-size': 24,
                            // 'text-valign': 'bottom',
                            'text-opacity': '0.4',
                            'text-rotation': '0.2',
                            'text-margin-y': '10px'
                        }
                    },
                    {
                        selector: '.option',
                        style: {
                            'font-size': 32,
                            'text-valign': 'top',
                            'text-opacity': '0.9',
                            shape: "hexagon",
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'curve-style': 'bezier',
                            'width': 4,
                            'line-color': '#666',
                            'source-arrow-color': '#000',
                            'source-arrow-shape': 'triangle'
                        }
                    }
                ],

                layout: {
                    name: "breadthfirst",
                    directed: true,
                    animate: true,
                    roots: 0,
                }
            });

            cy.ready(function () {
                var opt = cy.filter("node[type = 'option']");
                for (var i = 0; i < opt.length; i++) {
                    opt[i].addClass("option");
                }
            });
        }

    }]);
})();