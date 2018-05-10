(function () {
    'use strict';
    angular.module('dAppSvrApp').factory('graph', [function () {

        return {
            renderGraph: renderGraph
        }

        /**
         * It will render a delegation graph, elements are hidden by default and only the mainNode chain will be visible
         * @param {*} nodesAndEdges list of nodes and edges in the form:
         * { group: "nodes", data: { id: 0, name: "yes", type: "option" } }
         * { group: "edges", data: { id: id, source: 0, target: j } }
         * @param {*} classContainer DOM class where the graph will be visualized
         * @param {*} color Color of the nodes
         * @param {*} option main node used to filter all its reachable nodes
         */
        function renderGraph(nodesAndEdges, classContainer, color, mainNode = null) {

            let cy = cytoscape({
                container: document.getElementsByClassName(classContainer), // container to render in
                elements: nodesAndEdges,

                style: [ // the stylesheet for the graph
                    {
                        selector: '*',
                        style: {
                            visibility: 'hidden'
                        }
                    },
                    {
                        selector: 'node',
                        style: {
                            'background-color': color,
                            'label': 'data(name)',
                            'font-size': 24,
                            'text-opacity': '0.4',
                            // 'text-rotation': '0.2',
                            'text-margin-y': '0px'
                        }
                    },
                    {
                        selector: '.option',
                        style: {
                            'font-size': 40,
                            'text-valign': 'center',
                            'text-opacity': '1.0',
                            'height': '60px',
                            'width': '100px',
                            shape: "roundrectangle",
                            visibility: 'visible'
                        }
                    },
                    {
                        selector: '.chain',
                        style: {
                            visibility: 'visible'
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
                console.log("Graph ready");
                // Makes visible (applies some style) only the successors nodes of the main Node
                if (mainNode != null) {
                    var root = '#' + mainNode;
                    cy.$(root).addClass("option");
                    var successors0 = cy.$(root).successors();
                    for (var i = 0; i < successors0.length; i++) {
                        successors0[i].addClass("chain");
                    }
                }
            });
        }

    }]);
})();