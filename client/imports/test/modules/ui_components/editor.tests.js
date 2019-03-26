/* eslint-env mocha */

import { UIComponents } from '/client/imports/modules';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import $ from 'jquery';

chai.use(require('chai-jquery'));

const Ace = require('ace-builds');
const JSONEditor = require('jsoneditor');

describe('UIComponents Editor', () => {
  describe('Ace tests', () => {
    const exist = $('<pre id="exist" style="height: 500px"></pre>');
    const notExist = $('<pre id="notExist" style="height: 500px"></pre>');
    let editStub;

    beforeEach(() => {
      // FIXME stub $blockScrolling
      editStub = {
        getValue: sinon.stub().returns('{ test:213 }'),
        setTheme: sinon.stub(),
        session: {
          setMode: sinon.stub()
        },
        setOptions: sinon.stub(),
        setValue: sinon.stub()
      };
      sinon.stub(Ace, 'edit').withArgs(exist).returns(editStub).withArgs(notExist)
        .returns(null);
    });

    afterEach(() => {
      Ace.edit.restore();
    });

    describe('getAceEditorValue tests', () => {
      it('getAceEditorValue with ace editor exist', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue(exist);

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(exist)).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(1);
        expect(editStub.getValue.calledWithExactly()).to.equal(true);
        expect(result).to.equal('{ test:213 }');
      });

      it('getAceEditorValue with ace editor not exist', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue(notExist);

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(notExist)).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(0);
        expect(result).to.equal('');
      });

      it('getAceEditorValue with wrong selector', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.getAceEditorValue('sercan');

        // verify
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly('sercan')).to.equal(true);
        expect(editStub.getValue.callCount).to.equal(0);
        expect(result).to.equal('');
      });
    });

    describe('setAceEditorValue tests', () => {
      const assertNoCall = function (selector) {
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(selector)).to.equal(true);
        expect(editStub.setTheme.callCount).to.equal(0);
        expect(editStub.session.setMode.callCount).to.equal(0);
        expect(editStub.setOptions.callCount).to.equal(0);
        expect(editStub.setValue.callCount).to.equal(0);
      };

      const assertCallsExecuted = function (value) {
        expect(Ace.edit.callCount).to.equal(1);
        expect(Ace.edit.calledWithExactly(exist)).to.equal(true);
        expect(editStub.setTheme.callCount).to.equal(1);
        expect(editStub.setTheme.calledWithExactly('ace/theme/github')).to.equal(true);
        expect(editStub.session.setMode.callCount).to.equal(1);
        expect(editStub.session.setMode.calledWithExactly('ace/mode/json')).to.equal(true);
        expect(editStub.setOptions.callCount).to.equal(1);
        expect(editStub.setOptions.calledWithMatch({
          fontSize: '14px',
          showLineNumbers: true,
          showPrintMargin: false
        })).to.equal(true);
        expect(editStub.setValue.callCount).to.equal(1);
        expect(editStub.setValue.calledWithExactly(value, -1)).to.equal(true);
      };

      it('setAceEditorValue with ace editor exist and value exist', () => {
        // prepare
        const arg = { selector: exist, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertCallsExecuted('"testing_value"');
      });

      it('setAceEditorValue with ace editor not exist and value exist', () => {
        // prepare
        const arg = { selector: notExist, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertNoCall(notExist);
      });

      it('setAceEditorValue with ace editor exist and value not exist', () => {
        // prepare
        const arg = { selector: exist };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertCallsExecuted();
      });

      it('setAceEditorValue with ace editor selector wrong and value exist', () => {
        // prepare
        const selector = 'asdasd^^213';
        const arg = { selector, value: 'testing_value' };

        // execute
        UIComponents.Editor.setAceEditorValue(arg);

        // verify
        assertNoCall(selector);
      });
    });
  });

  describe('Grid tests', () => {
    const assertNormalExecution = function (tableValue) {
      expect($.prototype.find.callCount).to.equal(1);
      expect($.prototype.find.calledWithExactly('table')).to.equal(true);
      expect($.prototype.html.callCount).to.equal(1);
      expect($.prototype.html.calledWithExactly(tableValue)).to.equal(true);
      expect($.prototype.DataTable.callCount).to.equal(1);
      expect($.prototype.DataTable.calledWithMatch({ paging: false })).to.equal(true);
      expect($.prototype.on.callCount).to.equal(1);
      expect($.prototype.on.calledWith('dblclick', 'td[title]')).to.equal(true);
    };

    beforeEach(() => {
      sinon.spy($.prototype, 'find');
      sinon.spy($.prototype, 'on');
      sinon.spy($.prototype, 'DataTable');
      sinon.spy($.prototype, 'html');
    });

    afterEach(() => {
      $.prototype.find.restore();
      $.prototype.DataTable.restore();
      $.prototype.on.restore();
      $.prototype.html.restore();
    });

    describe('setGridEditorValue tests', () => {
      it('setGridEditorValue with valid selector & primitive value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: 'test' });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>0</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody>'
          + '<tr><td>t</td><td>e</td><td>s</td><td>t</td></tr></tbody></table>');
      });

      it('setGridEditorValue with valid selector & object value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: { first: 123, second: true, third: { a: 'sercan' } } });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>first</th><th>second</th><th>third</th></tr></thead><tbody>'
          + '<tr><td>123</td><td>true</td><td>{"a":"sercan"}</td></tr></tbody></table>');
      });

      it('setGridEditorValue with valid selector & array value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: 'editor', value: [{ first: 123 }, { second: 'test' }] });

        // verify
        assertNormalExecution('<table class="table table-bordered"><thead><tr><th>first</th><th>second</th></tr></thead><tbody>'
          + '<tr><td>123</td><td></td></tr><tr><td></td><td>test</td></tr></tbody></table>');
      });

      it('setGridEditorValue with invalid selector & valid value', () => {
        // prepare

        // execute
        UIComponents.Editor.setGridEditorValue({ selector: '', value: [{ first: 123 }, { second: 'test' }] });

        // verify
        expect($.prototype.find.callCount).to.equal(0);
        expect($.prototype.html.callCount).to.equal(0);
        expect($.prototype.DataTable.callCount).to.equal(0);
        expect($.prototype.on.callCount).to.equal(0);
      });
    });
  });

  describe('JsonEditor tests', () => {
    const initializedId = 'jsonEditor';
    const notExistId = 'noEditor';
    const jsonEditorResult = 123;

    beforeEach(() => {
      const jsonEditorDiv = document.createElement('div');
      jsonEditorDiv.setAttribute('id', initializedId);
      jsonEditorDiv.setAttribute('data-jsoneditor', jsonEditorResult);

      const emptyDiv = document.createElement('div');
      emptyDiv.setAttribute('id', notExistId);

      document.body.append(jsonEditorDiv);
      document.body.append(emptyDiv);

      sinon.spy($.prototype, 'data');
      sinon.spy($.prototype, 'find');
      sinon.spy(JSONEditor.prototype, '_create');
    });

    afterEach(() => {
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }

      $.prototype.data.restore();
      $.prototype.find.restore();
      JSONEditor.prototype._create.restore();
    });

    describe('initializeJSONEditor tests', () => {
      const assertNotExistExecution = function (result, options) {
        expect($.prototype.data.callCount).to.equal(2);
        expect($.prototype.data.getCall(0).args.length).to.equal(1);
        expect($.prototype.data.getCall(0).args[0]).to.equal('jsoneditor');
        expect($.prototype.data.getCall(0).thisValue.selector).to.equal(`#${notExistId}`);
        expect($.prototype.data.getCall(1).args.length).to.equal(2);
        expect($.prototype.data.getCall(1).args[0]).to.equal('jsoneditor');
        expect($.prototype.data.getCall(1).args[1]).to.be.an.instanceof(JSONEditor);
        expect($.prototype.data.getCall(1).thisValue.selector).to.equal(`#${notExistId}`);
        expect(JSONEditor.prototype._create.callCount).to.equal(1);
        expect(JSONEditor.prototype._create.calledWithMatch(document.getElementById(notExistId), options)).to.equal(true);
        expect(result).to.be.an.instanceof(JSONEditor);
      };

      it('initializeJSONEditor with valid params & jsoneditor initialized', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.initializeJSONEditor({ selector: initializedId });

        // verify
        expect($.prototype.data.callCount).to.equal(1);
        expect($.prototype.data.calledWithExactly('jsoneditor')).to.equal(true);
        expect($.prototype.data.getCall(0).thisValue.selector).to.equal(`#${initializedId}`);
        expect(JSONEditor.prototype._create.callCount).to.equal(0);
        expect(result).to.equal(jsonEditorResult);
      });

      it('initializeJSONEditor with valid params & jsoneditor not initialized', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.initializeJSONEditor({ selector: notExistId });

        // verify
        assertNotExistExecution(result, { mode: 'tree', modes: ['code', 'form', 'text', 'tree', 'view'], search: true });
      });

      it('initializeJSONEditor with wrong selector', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.initializeJSONEditor({ selector: '' });

        // verify
        expect($.prototype.data.callCount).to.equal(0);
        expect(JSONEditor.prototype._create.callCount).to.equal(0);
        expect(result).to.equal(undefined);
      });

      it('initializeJSONEditor with valid selector and some options', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.initializeJSONEditor({ selector: notExistId, options: { test_wrong: '213', search: false } });

        // verify
        assertNotExistExecution(result, { mode: 'tree', modes: ['code', 'form', 'text', 'tree', 'view'], search: false, test_wrong: '213' });
      });

      it('initializeJSONEditor with valid selector & some options & setDivData false', () => {
        // prepare

        // execute
        const result = UIComponents.Editor.initializeJSONEditor({ selector: notExistId, options: { test_wrong: '213', search: false }, setDivData: false });

        // verify
        expect($.prototype.data.callCount).to.equal(1);
        expect($.prototype.data.getCall(0).args.length).to.equal(1);
        expect($.prototype.data.getCall(0).args[0]).to.equal('jsoneditor');
        expect($.prototype.data.getCall(0).thisValue.selector).to.equal(`#${notExistId}`);
        expect(JSONEditor.prototype._create.callCount).to.equal(1);
        expect(JSONEditor.prototype._create.calledWithMatch(document.getElementById(notExistId),
          { mode: 'tree', modes: ['code', 'form', 'text', 'tree', 'view'], search: false, test_wrong: '213' })).to.equal(true);
        expect(result).to.be.an.instanceof(JSONEditor);
      });
    });
  });
});
