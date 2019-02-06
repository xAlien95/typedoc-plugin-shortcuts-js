import { Declaration, ParameterDeclaration } from 'typescript';

import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Context } from 'typedoc/dist/lib/converter/context';
import { Converter } from 'typedoc/dist/lib/converter/converter';
import { Reflection } from 'typedoc/dist/lib/models/reflections/abstract';
import { ParameterReflection } from 'typedoc/dist/lib/models/reflections/parameter';


@Component({ name: 'shortcuts-js' })
export class ShortcutsJSPlugin extends ConverterComponent {
  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_CREATE_PARAMETER]: this.onParameter,
      [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
    });
  }

  /**
   * Triggered when the converter has created a parameter reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param parameter  The parameter that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onParameter(context: Context, parameter: ParameterReflection, node?: ParameterDeclaration) {
    // fixes https://github.com/TypeStrong/typedoc/issues/957
    parameter.type = context.converter.convertType(context, node.type, context.getTypeAtLocation(node));
  }

  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onDeclaration(_context: Context, reflection: Reflection, _node?: Declaration) {
    if (!reflection.comment || !reflection.comment.hasTag('action')) return;

    const last = reflection.comment.tags.pop();
    const [content, shortText, ...text] = last.text.split('\n\n');

    last.text = content;
    reflection.comment.tags.push(last);
    reflection.comment.shortText = shortText;
    reflection.comment.text = text.join('\n\n');
  }

};
