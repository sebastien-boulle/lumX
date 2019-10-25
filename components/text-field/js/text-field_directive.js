import { CSS_PREFIX } from '@lumx/core/js/constants';

import { mdiAlertCircle, mdiCheckCircle, mdiCloseCircle } from '@lumx/icons';

import template from '../views/text-field.html';

/////////////////////////////

function TextFieldController(LxUtilsService) {
    'ngInject';

    // eslint-disable-next-line consistent-this
    const lx = this;

    /////////////////////////////
    //                         //
    //    Private attributes   //
    //                         //
    /////////////////////////////

    /**
     * The model controller.
     *
     * @type {Object}
     */
    let _modelController;

    /////////////////////////////
    //                         //
    //    Public attributes    //
    //                         //
    /////////////////////////////

    /**
     * Whether the directive has chips slot filled or not.
     *
     * @type {boolean}
     */
    lx.hasChips = false;

    /**
     * Whether the directive has input slot filled or not.
     *
     * @type {boolean}
     */
    lx.hasInput = false;

    /**
     * The text field icons.
     *
     * @type {Object}
     */
    lx.icons = {
        mdiAlertCircle,
        mdiCheckCircle,
        mdiCloseCircle,
    };

    /**
     * The input id.
     *
     * @type {string}
     */
    lx.inputId = LxUtilsService.generateUUID();

    /////////////////////////////
    //                         //
    //     Public functions    //
    //                         //
    /////////////////////////////

    /**
     * Clear the model on clear button click.
     *
     * @param {Event} [evt] The event that triggered the function.
     */
    function clearModel(evt) {
        if (angular.isDefined(evt)) {
            evt.stopPropagation();
        }

        _modelController.$setViewValue(undefined);
        _modelController.$render();
    }

    /**
     * Define if the model controller has a value or not.
     *
     * @return {boolean} Wether the model controller has a value or not.
     */
    function hasValue() {
        if (angular.isUndefined(_modelController) || angular.isUndefined(_modelController.$viewValue)) {
            return false;
        }

        return _modelController.$viewValue.length;
    }

    /**
     * Set the model controller.
     *
     * @param {Object} modelController The model controller.
     */
    function setModelController(modelController) {
        _modelController = modelController;
    }

    /////////////////////////////

    lx.clearModel = clearModel;
    lx.hasValue = hasValue;
    lx.setModelController = setModelController;
}

/////////////////////////////

function TextFieldDirective($timeout) {
    'ngInject';

    function link(scope, el, attrs, ctrl, transclude) {
        if (transclude.isSlotFilled('chips')) {
            ctrl.hasChips = true;
        }

        if (transclude.isSlotFilled('input')) {
            ctrl.hasInput = true;
        }

        $timeout(() => {
            let input = el.find('input');

            if (input.length === 1) {
                el.addClass(`${CSS_PREFIX}-text-field--has-input`);
            } else {
                const minRows = 2;

                input = el.find('textarea');

                input.on('input', (evt) => {
                    evt.target.rows = minRows;
                    const currentRows = evt.target.scrollHeight / (evt.target.clientHeight / minRows);
                    evt.target.rows = currentRows;
                });

                el.addClass(`${CSS_PREFIX}-text-field--has-textarea`);
            }

            const modelController = input.data('$ngModelController');

            ctrl.setModelController(modelController);

            if (input.attr('id')) {
                ctrl.inputId = input.attr('id');
            } else {
                input.attr('id', ctrl.inputId);
            }

            input
                .on('focus', () => {
                    el.addClass(`${CSS_PREFIX}-text-field--is-focus`);
                })
                .on('blur', () => {
                    el.removeClass(`${CSS_PREFIX}-text-field--is-focus`);
                });

            attrs.$observe('disabled', (isDisabled) => {
                if (isDisabled) {
                    el.addClass(`${CSS_PREFIX}-text-field--is-disabled`);
                } else {
                    el.removeClass(`${CSS_PREFIX}-text-field--is-disabled`);
                }
            });

            scope.$watch(
                () => {
                    return ctrl.focus;
                },
                (isfocus) => {
                    if (angular.isDefined(isfocus) && isfocus) {
                        $timeout(() => {
                            input.focus();

                            ctrl.focus = false;
                        });
                    }
                },
            );

            if (angular.isDefined(modelController.$$attr)) {
                modelController.$$attr.$observe('disabled', (isDisabled) => {
                    if (isDisabled) {
                        el.addClass(`${CSS_PREFIX}-text-field--is-disabled`);
                    } else {
                        el.removeClass(`${CSS_PREFIX}-text-field--is-disabled`);
                    }
                });

                modelController.$$attr.$observe('placeholder', (placeholder) => {
                    if (placeholder.length > 0) {
                        el.addClass(`${CSS_PREFIX}-text-field--has-placeholder`);
                    } else {
                        el.removeClass(`${CSS_PREFIX}-text-field--has-placeholder`);
                    }
                });
            }

            scope.$on('$destroy', () => {
                input.off();
            });
        });
    }

    return {
        bindToController: true,
        controller: TextFieldController,
        controllerAs: 'lx',
        link,
        replace: true,
        restrict: 'E',
        scope: {
            customColors: '=?lxCustomColors',
            focus: '=?lxFocus',
            hasError: '=?lxError',
            helper: '@?lxHelper',
            icon: '@?lxIcon',
            isClearable: '=?lxAllowClear',
            isValid: '=?lxValid',
            label: '@?lxLabel',
            theme: '@?lxTheme',
        },
        template,
        transclude: {
            chips: '?lxTextFieldChips',
            input: '?lxTextFieldInput',
        },
    };
}

/////////////////////////////

angular.module('lumx.text-field').directive('lxTextField', TextFieldDirective);

/////////////////////////////

export { TextFieldDirective };