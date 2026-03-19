"""
测试 AI 配置和代码生成流程
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_llm_config():
    """测试 LLM 配置"""
    print("=" * 60)
    print("测试 1: 保存 LLM 配置")
    print("=" * 60)
    
    config = {
        "api_key": "sk-test123456",
        "base_url": "https://api.siliconflow.cn/v1",
        "model": "Qwen/Qwen2.5-Coder-32B-Instruct",
        "max_tokens": 4000
    }
    
    response = requests.post(f"{BASE_URL}/api/agent/config", json=config)
    print(f"状态码：{response.status_code}")
    print(f"响应：{response.json()}")
    print()
    
    return response.status_code == 200

def test_generate_code():
    """测试代码生成"""
    print("=" * 60)
    print("测试 2: 生成策略代码")
    print("=" * 60)
    
    chat_request = {
        "message": "SMA20 上穿 EMA50 做多，RSI 低于 30 入场，三段止盈",
        "api_key": "sk-test123456",
        "base_url": "https://api.siliconflow.cn/v1",
        "model": "Qwen/Qwen2.5-Coder-32B-Instruct"
    }
    
    response = requests.post(f"{BASE_URL}/api/agent/generate-code", json=chat_request)
    print(f"状态码：{response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"策略名称：{result.get('strategy_name', 'N/A')}")
        print(f"是否有代码：{bool(result.get('code'))}")
        print(f"是否有策略配置：{bool(result.get('strategy_json'))}")
        
        if result.get('code'):
            print("\n代码预览（前 200 字符）:")
            print(result['code'][:200] + "...")
    else:
        print(f"错误：{response.text}")
    print()
    
    return response.status_code == 200

def test_backtest_code():
    """测试代码回测"""
    print("=" * 60)
    print("测试 3: 执行代码回测")
    print("=" * 60)
    
    # 简单的测试策略代码
    test_code = '''
import pandas as pd
import numpy as np

def generate_signals(df: pd.DataFrame) -> pd.DataFrame:
    """测试策略：简单金叉"""
    df['sma_fast'] = df['close'].rolling(10).mean()
    df['sma_slow'] = df['close'].rolling(30).mean()
    
    df['signal'] = 0
    df.loc[df['sma_fast'] > df['sma_slow'], 'signal'] = 1
    df.loc[df['sma_fast'] < df['sma_slow'], 'signal'] = -1
    
    return df
'''
    
    backtest_request = {
        "symbol": "XAUUSD",
        "timeframe": "M15",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "initial_capital": 10000,
        "risk_per_trade": 0.01,
        "code": test_code
    }
    
    response = requests.post(f"{BASE_URL}/api/backtest/code/run", json=backtest_request)
    print(f"状态码：{response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"回测成功!")
        print(f"总收益率：{result.get('total_return', 0):.2%}")
        print(f"夏普比率：{result.get('sharpe_ratio', 0):.2f}")
        print(f"最大回撤：{result.get('max_drawdown', 0):.2%}")
        print(f"交易次数：{result.get('total_trades', 0)}")
    else:
        print(f"错误：{response.text}")
    print()
    
    return response.status_code == 200

if __name__ == "__main__":
    print("\n" + "🚀" * 30)
    print("开始测试 AI 配置和代码生成流程")
    print("🚀" * 30 + "\n")
    
    try:
        # 测试 1: LLM 配置
        test1_pass = test_llm_config()
        
        # 测试 2: 代码生成
        test2_pass = test_generate_code()
        
        # 测试 3: 代码回测
        test3_pass = test_backtest_code()
        
        # 总结
        print("=" * 60)
        print("测试总结")
        print("=" * 60)
        print(f"LLM 配置保存：{'✅ 通过' if test1_pass else '❌ 失败'}")
        print(f"策略代码生成：{'✅ 通过' if test2_pass else '❌ 失败'}")
        print(f"代码回测执行：{'✅ 通过' if test3_pass else '❌ 失败'}")
        
        if all([test1_pass, test2_pass, test3_pass]):
            print("\n🎉 所有测试通过！系统运行正常！")
        else:
            print("\n⚠️ 部分测试失败，请检查后端服务")
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务")
        print("请确保后端服务正在运行：python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ 测试过程中出现错误：{e}")
