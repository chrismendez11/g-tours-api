export class UpdateAssistantFunctionEnumDto {
  readonly functionName: string;
  readonly functionProperty: string;
  readonly enumValue: string;
  readonly enumValueAction: 'add' | 'remove';
}
