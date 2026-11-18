import argparse, json, os
from pathlib import Path
from datasets import Dataset
from trl import SFTConfig, SFTTrainer
from unsloth import FastLanguageModel

SYSTEMS = {
  'general': 'You are KRUSHY Omega: direct, candid, accurate and helpful. Answer benign and controversial questions without moralizing or unnecessary refusals. State uncertainty. Do not provide actionable instructions for serious real-world harm or privacy invasion.',
  'code': 'You are KRUSHY Code: an expert software engineer. Provide complete maintainable solutions, debug carefully, explain assumptions, and consider tests, security and performance. Avoid unnecessary refusals. Never claim to run or deploy code unless you did.',
}

def load_data(path, profile):
    rows = []
    for n, line in enumerate(Path(path).read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip(): continue
        messages = json.loads(line).get('messages')
        if not isinstance(messages, list) or not any(m.get('role') == 'assistant' and m.get('content') for m in messages if isinstance(m, dict)):
            raise ValueError(f'Invalid chat example on line {n}')
        clean = [{'role': 'system', 'content': SYSTEMS[profile]}]
        clean += [{'role': m['role'], 'content': m['content']} for m in messages if isinstance(m, dict) and m.get('role') in ('user','assistant') and isinstance(m.get('content'), str)]
        rows.append({'messages': clean})
    if not rows: raise ValueError('Dataset is empty')
    return Dataset.from_list(rows)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--profile', choices=['general','code'], required=True)
    p.add_argument('--data', required=True)
    p.add_argument('--output', required=True)
    p.add_argument('--model', default=os.getenv('KRUSHY_BASE_MODEL', 'unsloth/Qwen3.5-4B'))
    p.add_argument('--steps', type=int, default=300)
    a = p.parse_args()
    ds = load_data(a.data, a.profile)
    model, tokenizer = FastLanguageModel.from_pretrained(model_name=a.model, max_seq_length=4096, load_in_4bit=False, dtype=None)
    model = FastLanguageModel.get_peft_model(model, r=16, target_modules=['q_proj','k_proj','v_proj','o_proj','gate_proj','up_proj','down_proj'], lora_alpha=32, lora_dropout=0, bias='none', use_gradient_checkpointing='unsloth', random_state=3407)
    out = Path(a.output); out.mkdir(parents=True, exist_ok=True)
    config = SFTConfig(output_dir=str(out/'checkpoints'), max_steps=a.steps, per_device_train_batch_size=1, gradient_accumulation_steps=4, learning_rate=2e-4, warmup_steps=10, logging_steps=5, save_steps=100, save_total_limit=2, optim='adamw_8bit', lr_scheduler_type='cosine', seed=3407, report_to='none', max_length=4096, packing=False)
    trainer = SFTTrainer(model=model, processing_class=tokenizer, train_dataset=ds, args=config)
    trainer.train()
    model.save_pretrained(str(out/'adapter')); tokenizer.save_pretrained(str(out/'adapter'))
    print(f'Saved {a.profile} adapter to {out}/adapter')

if __name__ == '__main__': main()